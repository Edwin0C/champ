export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: 'admin' | 'client';
  balance: number;
  nombre: string;
  apellido: string;
  phone: string;
  bonus_claimed: boolean;
  is_disabled: boolean;
  withdraw_account_name?: string | null;
  withdraw_bank_name?: string | null;
  withdraw_account_number?: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  daily_income: number;
  total_income: number;
  days_duration: number;
  vip_level: number;
  image_url: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'investment' | 'claim';
  amount: number;
  date: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UserProduct {
  id: number;
  user_id: number;
  product_id: number;
  purchased_at: string;
  last_claimed_at: string | null;
  times_claimed: number;
  product?: Product;
}

export interface ClientProductView {
  up: UserProduct;
  product: Product;
  canClaim: boolean;
  remainingSeconds: number;
  remainingClaims: number;
  totalEarned: number;
}

export interface SessionUser {
  id: number;
  username: string;
  role: 'admin' | 'client';
  nombre: string;
  apellido: string;
  phone: string;
}
