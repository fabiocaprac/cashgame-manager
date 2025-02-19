
export type Player = {
  id: string;
  name: string;
  game_id: string;
  created_at: string;
  balance?: number;
  purchases: number;
  returns: number;
  cashPayments: number;
  cardPayments: number;
  pixPayments: number;
};

export type TransactionType = "buy-in" | "cash-out" | "refund";
export type PaymentMethod = "cash" | "card" | "pix";

export type Transaction = {
  id: string;
  player_id: string;
  type: TransactionType;
  chips: number;
  payment: number;
  method: PaymentMethod;
  created_at: string;
  session_id?: string;
  closed_register_id?: string;
};

export type Game = {
  id: string;
  name: string | null;
  notes?: string;
  created_at: string;
  created_by: string;
  last_transaction_at: string | null;
  current_balance?: number;
};
