'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminSupabase } from './supabase/server';
import { getCurrentUser, getSession, hashPassword, setSession, verifyPassword, clearSession } from './auth';
import { Product, Transaction, User, UserProduct } from './types';

// ==========================================
// AUTH ACTIONS
// ==========================================

export async function loginAction(formData: FormData) {
  const usernameInput = (formData.get('username') as string || '').trim();
  const password = formData.get('password') as string || '';

  if (!usernameInput || !password) {
    return { error: 'Por favor complete todos los campos.' };
  }

  const supabase = getAdminSupabase();

  // El usuario puede ingresar "987654321" (sin +593) o "saturno6" para admin
  let queryUser = usernameInput;
  if (!usernameInput.startsWith('+593') && /^\d+$/.test(usernameInput)) {
    queryUser = '+593' + usernameInput;
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .or(`username.eq.${queryUser},username.eq.${usernameInput},phone.eq.${queryUser}`)
    .single();

  if (error || !user) {
    return { error: 'Credenciales inválidas. Verifica tu usuario y contraseña.' };
  }

  if (user.is_disabled) {
    return { error: 'Tu cuenta ha sido deshabilitada. Contacta al soporte.' };
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return { error: 'Credenciales inválidas. Verifica tu usuario y contraseña.' };
  }

  await setSession(user as User);

  if (user.role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/');
  }
}

export async function registerAction(formData: FormData) {
  const nombre = (formData.get('nombre') as string || '').trim();
  const apellido = (formData.get('apellido') as string || '').trim();
  const rawPhone = (formData.get('phone') as string || '').trim();
  const password = formData.get('password') as string || '';

  if (!nombre || !apellido || !rawPhone || !password) {
    return { error: 'Por favor completa todos los campos requeridos.' };
  }

  const phone = rawPhone.startsWith('+593') ? rawPhone : '+593' + rawPhone;
  const username = phone;

  const supabase = getAdminSupabase();

  // Check if exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .or(`username.eq.${username},phone.eq.${phone}`)
    .single();

  if (existingUser) {
    return { error: 'Este número de teléfono ya está registrado.' };
  }

  const password_hash = await hashPassword(password);

  const { data: newUser, error } = await supabase
    .from('users')
    .insert([
      {
        username,
        phone,
        nombre,
        apellido,
        password_hash,
        role: 'client',
        balance: 3.00, // Bono de registro inicial
        bonus_claimed: true,
      },
    ])
    .select('*')
    .single();

  if (error || !newUser) {
    return { error: 'Error al registrar el usuario. Intenta nuevamente.' };
  }

  await setSession(newUser as User);
  redirect('/');
}

export async function logoutAction() {
  await clearSession();
  redirect('/login');
}

// ==========================================
// CLIENT ACTIONS
// ==========================================

export async function investAction(productId: number) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Debes iniciar sesión para invertir.' };
  }

  const supabase = getAdminSupabase();

  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (prodErr || !product) {
    return { error: 'Producto no encontrado.' };
  }

  if (Number(user.balance) < Number(product.price)) {
    return { error: 'Saldo insuficiente para esta inversión.' };
  }

  const newBalance = Number(user.balance) - Number(product.price);

  // Descontar saldo del usuario
  const { error: userErr } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('id', user.id);

  if (userErr) {
    return { error: 'Error al procesar el débito de tu saldo.' };
  }

  // Crear registro UserProduct
  await supabase.from('user_products').insert([
    {
      user_id: user.id,
      product_id: product.id,
      times_claimed: 0,
    },
  ]);

  // Crear transacción
  await supabase.from('transactions').insert([
    {
      user_id: user.id,
      type: 'investment',
      amount: product.price,
      details: `Inversión en ${product.title}`,
      status: 'approved',
    },
  ]);

  revalidatePath('/');
  revalidatePath('/my-products');
  revalidatePath('/profile');
  return { success: `¡Has invertido en ${product.title}! Revisa "Mis productos" para reclamar tus ganancias.` };
}

export async function claimAction(userProductId: number) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Debes iniciar sesión.' };
  }

  const supabase = getAdminSupabase();

  const { data: up, error: upErr } = await supabase
    .from('user_products')
    .select('*, product:products(*)')
    .eq('id', userProductId)
    .eq('user_id', user.id)
    .single();

  if (upErr || !up || !up.product) {
    return { error: 'Inversión no encontrada.' };
  }

  const product = up.product as Product;
  const now = new Date();

  // Validar 24h
  const baseTime = up.last_claimed_at ? new Date(up.last_claimed_at) : new Date(up.purchased_at);
  const nextClaimTime = new Date(baseTime.getTime() + 24 * 60 * 60 * 1000);

  if (now.getTime() < nextClaimTime.getTime()) {
    return { error: 'Aún no puedes reclamar. Espera a que se complete el tiempo de 24 horas.' };
  }

  if (up.times_claimed >= product.days_duration) {
    return { error: 'Ya has alcanzado el máximo de reclamos para este producto.' };
  }

  const dailyIncome = Number(product.daily_income);
  const newBalance = Number(user.balance) + dailyIncome;
  const newTimesClaimed = up.times_claimed + 1;

  // Actualizar usuario
  await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);

  // Actualizar UserProduct
  await supabase
    .from('user_products')
    .update({
      times_claimed: newTimesClaimed,
      last_claimed_at: now.toISOString(),
    })
    .eq('id', up.id);

  // Registrar transacción
  await supabase.from('transactions').insert([
    {
      user_id: user.id,
      type: 'claim',
      amount: dailyIncome,
      details: `Reclamo diario de ${product.title} (día ${newTimesClaimed}/${product.days_duration})`,
      status: 'approved',
    },
  ]);

  revalidatePath('/my-products');
  revalidatePath('/profile');
  revalidatePath('/');
  return { success: `¡Has reclamado $${dailyIncome.toFixed(2)} de ${product.title}!` };
}

export async function rechargeRequestAction(amount: number) {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autorizado' };

  if (amount <= 0) return { error: 'Monto inválido' };

  const supabase = getAdminSupabase();
  const { error } = await supabase.from('transactions').insert([
    {
      user_id: user.id,
      type: 'deposit',
      amount: amount,
      details: 'Solicitud de Recarga',
      status: 'pending',
    },
  ]);

  if (error) return { error: 'Error al registrar solicitud' };

  revalidatePath('/records');
  return { success: true };
}

export async function saveWithdrawAccountAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autorizado' };

  const account_name = (formData.get('account_name') as string || '').trim();
  const bank_name = (formData.get('bank_name') as string || '').trim();
  const account_number = (formData.get('account_number') as string || '').trim();

  if (!account_name || !bank_name || !account_number) {
    return { error: 'Todos los campos son obligatorios.' };
  }

  const supabase = getAdminSupabase();
  const { error } = await supabase
    .from('users')
    .update({
      withdraw_account_name: account_name,
      withdraw_bank_name: bank_name,
      withdraw_account_number: account_number,
    })
    .eq('id', user.id);

  if (error) return { error: 'Error al guardar la cuenta' };

  revalidatePath('/withdraw-account');
  revalidatePath('/profile');
  return { success: 'Cuenta de retiro guardada correctamente.' };
}

// ==========================================
// ADMIN ACTIONS
// ==========================================

export async function adminApproveRechargeAction(txId: number) {
  const session = await getSession();
  if (session?.role !== 'admin') return { error: 'No autorizado' };

  const supabase = getAdminSupabase();
  const { data: tx } = await supabase.from('transactions').select('*').eq('id', txId).single();

  if (!tx || tx.status !== 'pending') return { error: 'Transacción no válida' };

  if (tx.type === 'deposit') {
    const { data: user } = await supabase.from('users').select('balance').eq('id', tx.user_id).single();
    if (user) {
      const newBal = Number(user.balance) + Number(tx.amount);
      await supabase.from('users').update({ balance: newBal }).eq('id', tx.user_id);
    }
  }

  await supabase.from('transactions').update({ status: 'approved' }).eq('id', txId);
  revalidatePath('/admin');
  return { success: `Recarga de $${tx.amount} aprobada.` };
}

export async function adminRejectRechargeAction(txId: number) {
  const session = await getSession();
  if (session?.role !== 'admin') return { error: 'No autorizado' };

  const supabase = getAdminSupabase();
  const { data: tx } = await supabase.from('transactions').select('*').eq('id', txId).single();

  if (!tx || tx.status !== 'pending') return { error: 'Transacción no válida' };

  if (tx.type === 'investment') {
    // Refund investment if rejected
    const { data: user } = await supabase.from('users').select('balance').eq('id', tx.user_id).single();
    if (user) {
      const newBal = Number(user.balance) + Number(tx.amount);
      await supabase.from('users').update({ balance: newBal }).eq('id', tx.user_id);
    }
  }

  await supabase.from('transactions').update({ status: 'rejected' }).eq('id', txId);
  revalidatePath('/admin');
  return { success: 'Solicitud rechazada.' };
}

export async function adminUpdateBalanceAction(userId: number, newBalance: number) {
  const session = await getSession();
  if (session?.role !== 'admin') return { error: 'No autorizado' };

  const supabase = getAdminSupabase();
  await supabase.from('users').update({ balance: newBalance }).eq('id', userId);
  revalidatePath('/admin');
  return { success: 'Balance actualizado.' };
}

export async function adminDirectRechargeAction(userId: number, amount: number) {
  const session = await getSession();
  if (session?.role !== 'admin') return { error: 'No autorizado' };

  const supabase = getAdminSupabase();
  const { data: user } = await supabase.from('users').select('balance, nombre, apellido').eq('id', userId).single();
  if (!user) return { error: 'Usuario no encontrado' };

  const newBal = Number(user.balance) + amount;
  await supabase.from('users').update({ balance: newBal }).eq('id', userId);

  await supabase.from('transactions').insert([
    {
      user_id: userId,
      type: 'deposit',
      amount: amount,
      details: `Recarga por admin ($${amount})`,
      status: 'approved',
    },
  ]);

  revalidatePath('/admin');
  return { success: `Recarga de $${amount} aplicada a ${user.nombre} ${user.apellido}.` };
}

export async function adminToggleUserAction(userId: number, currentDisabled: boolean) {
  const session = await getSession();
  if (session?.role !== 'admin') return { error: 'No autorizado' };

  const supabase = getAdminSupabase();
  await supabase.from('users').update({ is_disabled: !currentDisabled }).eq('id', userId);
  revalidatePath('/admin');
  return { success: `Usuario ${!currentDisabled ? 'deshabilitado' : 'habilitado'}.` };
}

export async function adminDeleteUserAction(userId: number) {
  const session = await getSession();
  if (session?.role !== 'admin') return { error: 'No autorizado' };

  const supabase = getAdminSupabase();
  // Borrar registros asociados primero
  await supabase.from('user_products').delete().eq('user_id', userId);
  await supabase.from('transactions').delete().eq('user_id', userId);
  await supabase.from('users').delete().eq('id', userId);

  revalidatePath('/admin');
  return { success: 'Usuario eliminado permanentemente.' };
}

export async function adminAddProductAction(formData: FormData) {
  const session = await getSession();
  if (session?.role !== 'admin') return { error: 'No autorizado' };

  const title = (formData.get('title') as string || '').trim();
  const description = (formData.get('description') as string || '').trim();
  const price = Number(formData.get('price') || 0);
  const image_url = (formData.get('image_url') as string || '').trim();
  const daily_income = Number(formData.get('daily_income') || 0);
  const total_income = Number(formData.get('total_income') || 0);
  const days_duration = Number(formData.get('days_duration') || 90);

  const supabase = getAdminSupabase();
  await supabase.from('products').insert([
    {
      title,
      description,
      price,
      image_url,
      daily_income,
      total_income,
      days_duration,
    },
  ]);

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: 'Producto agregado exitosamente.' };
}
