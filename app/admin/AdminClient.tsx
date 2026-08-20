'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Transaction, User } from '@/lib/types';
import {
  adminApproveRechargeAction,
  adminRejectRechargeAction,
  adminUpdateBalanceAction,
  adminDirectRechargeAction,
  adminToggleUserAction,
  adminDeleteUserAction,
  adminAddProductAction,
  logoutAction,
} from '@/lib/actions';
import { formatEcuadorDateTime } from '@/lib/time';
import FlashMessage from '@/components/FlashMessage';
import {
  Shield,
  Users,
  Clock,
  PlusCircle,
  LogOut,
  Check,
  X,
  History,
  DollarSign,
  Trash2,
  Power,
  Edit,
} from 'lucide-react';

interface AdminClientProps {
  adminUser: User;
  clients: User[];
  pendingRecharges: Transaction[];
  pendingInvestments: Transaction[];
}

export default function AdminClient({
  adminUser,
  clients,
  pendingRecharges,
  pendingInvestments,
}: AdminClientProps) {
  const router = useRouter();
  const [flash, setFlash] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // Modals state
  const [rechargeModalUser, setRechargeModalUser] = useState<User | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');

  const [balanceModalUser, setBalanceModalUser] = useState<User | null>(null);
  const [newBalance, setNewBalance] = useState('');

  const [editModalUser, setEditModalUser] = useState<User | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [loading, setLoading] = useState(false);

  // Actions
  const handleApproveRecharge = async (txId: number) => {
    const res = await adminApproveRechargeAction(txId);
    if (res?.success) setFlash({ message: res.success, type: 'success' });
    router.refresh();
  };

  const handleRejectRecharge = async (txId: number) => {
    const res = await adminRejectRechargeAction(txId);
    if (res?.success) setFlash({ message: res.success, type: 'success' });
    router.refresh();
  };

  const handleDirectRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeModalUser) return;
    setLoading(true);
    const res = await adminDirectRechargeAction(rechargeModalUser.id, Number(rechargeAmount));
    setLoading(false);
    setRechargeModalUser(null);
    setRechargeAmount('');
    if (res?.success) setFlash({ message: res.success, type: 'success' });
    router.refresh();
  };

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceModalUser) return;
    setLoading(true);
    const res = await adminUpdateBalanceAction(balanceModalUser.id, Number(newBalance));
    setLoading(false);
    setBalanceModalUser(null);
    setNewBalance('');
    if (res?.success) setFlash({ message: res.success, type: 'success' });
    router.refresh();
  };

  const handleToggleUser = async (user: User) => {
    const res = await adminToggleUserAction(user.id, user.is_disabled);
    if (res?.success) setFlash({ message: res.success, type: 'success' });
    router.refresh();
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`¿Estás seguro de eliminar permanentemente a ${user.nombre} ${user.apellido}?`)) {
      const res = await adminDeleteUserAction(user.id);
      if (res?.success) setFlash({ message: res.success, type: 'success' });
      router.refresh();
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await adminAddProductAction(formData);
    setLoading(false);
    setShowAddProduct(false);
    if (res?.success) setFlash({ message: res.success, type: 'success' });
    router.refresh();
  };

  return (
    <div className="p-4 space-y-6 pb-12">
      <FlashMessage message={flash?.message} type={flash?.type} onClose={() => setFlash(null)} />

      {/* Admin Header */}
      <div className="bg-liga-dark rounded-2xl p-5 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-liga-yellow rounded-xl flex items-center justify-center text-liga-dark">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Panel de Administración</h1>
            <p className="text-gray-400 text-xs">Administrador: {adminUser.username}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowAddProduct(true)}
          className="flex-1 bg-liga-blue hover:bg-liga-dark text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" /> Agregar Token
        </button>
      </div>

      {/* Pending Recharges Section */}
      <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-liga-yellow" />
            <h2 className="font-bold text-liga-dark">Recargas Pendientes</h2>
          </div>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
            {pendingRecharges.length}
          </span>
        </div>

        {pendingRecharges.length > 0 ? (
          <div className="space-y-3">
            {pendingRecharges.map((tx) => (
              <div
                key={tx.id}
                className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-200"
              >
                <div>
                  <p className="font-bold text-liga-dark text-sm">
                    Usuario #{tx.user_id} - ${Number(tx.amount).toFixed(2)} USD
                  </p>
                  <p className="text-gray-400 text-xs">{formatEcuadorDateTime(tx.date)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApproveRecharge(tx.id)}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                    title="Aprobar"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectRecharge(tx.id)}
                    className="p-2 bg-liga-red hover:bg-red-700 text-white rounded-lg transition"
                    title="Rechazar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-xs text-center py-4">No hay recargas pendientes</p>
        )}
      </div>

      {/* Pending Investments Section */}
      {pendingInvestments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-liga-blue" />
              <h2 className="font-bold text-liga-dark">Inversiones Pendientes</h2>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
              {pendingInvestments.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingInvestments.map((tx) => (
              <div
                key={tx.id}
                className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-200"
              >
                <div>
                  <p className="font-bold text-liga-dark text-sm">
                    Usuario #{tx.user_id} - ${Number(tx.amount).toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-xs">{tx.details}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApproveRecharge(tx.id)}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                    title="Aprobar"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectRecharge(tx.id)}
                    className="p-2 bg-liga-red hover:bg-red-700 text-white rounded-lg transition"
                    title="Rechazar (Reembolsar)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users List Section */}
      <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-liga-blue" />
            <h2 className="font-bold text-liga-dark">Lista de Usuarios</h2>
          </div>
          <span className="text-gray-400 text-xs font-medium">{clients.length} usuarios</span>
        </div>

        <div className="space-y-4">
          {clients.map((u) => (
            <div
              key={u.id}
              className={`p-4 rounded-xl border ${
                u.is_disabled ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-white border-gray-200'
              } shadow-sm space-y-3`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-liga-dark text-sm">
                    {u.nombre} {u.apellido}
                  </h3>
                  <p className="text-gray-500 text-xs font-mono">{u.phone}</p>
                  <p className="text-liga-red font-bold text-sm mt-1">
                    Saldo: ${Number(u.balance).toFixed(2)} USD
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/user/${u.id}/history`}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                    title="Historial de transacciones"
                  >
                    <History className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setRechargeModalUser(u);
                      setRechargeAmount('');
                    }}
                    className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition"
                    title="Recarga directa"
                  >
                    <DollarSign className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBalanceModalUser(u);
                      setNewBalance(String(u.balance));
                    }}
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-liga-blue rounded-lg transition"
                    title="Editar saldo"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleUser(u)}
                    className={`p-2 rounded-lg transition ${
                      u.is_disabled
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={u.is_disabled ? 'Habilitar' : 'Deshabilitar'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-liga-red rounded-lg transition"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Recharge Modal */}
      {rechargeModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-liga-dark text-lg">
              Recarga Directa a {rechargeModalUser.nombre}
            </h3>
            <form onSubmit={handleDirectRecharge} className="space-y-4">
              <input
                type="number"
                step="0.01"
                placeholder="Monto a recargar"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                required
                className="w-full border-2 border-gray-300 rounded-lg p-3 outline-none focus:border-liga-yellow"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setRechargeModalUser(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-bold disabled:opacity-50"
                >
                  {loading ? 'Aplicando...' : 'Aplicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-liga-dark text-lg">
              Modificar Saldo de {balanceModalUser.nombre}
            </h3>
            <form onSubmit={handleUpdateBalance} className="space-y-4">
              <input
                type="number"
                step="0.01"
                placeholder="Nuevo saldo"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                required
                className="w-full border-2 border-gray-300 rounded-lg p-3 outline-none focus:border-liga-yellow"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setBalanceModalUser(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-liga-blue text-white font-bold disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-liga-dark text-lg">Agregar Nuevo Token / Producto</h3>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600">Título</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Ej: Mbappe-Token"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">Descripción</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Ingresos diarios..."
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">Precio (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  placeholder="100"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">Ingreso Diario (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  name="daily_income"
                  placeholder="25"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">Ingreso Total (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  name="total_income"
                  placeholder="2250"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">Duración (Días)</label>
                <input
                  type="number"
                  name="days_duration"
                  defaultValue="90"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">URL de Imagen</label>
                <input
                  type="text"
                  name="image_url"
                  placeholder="/images/1.png"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-liga-blue text-white font-bold text-sm disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Crear Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
