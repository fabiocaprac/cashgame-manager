export type Player = {
  id: string;
  name: string;
  game_id: string;
  created_at: string;
  purchases: number;
  returns: number;
  cashPayments: number;
  cardPayments: number;
  pixPayments: number;
};

export type TransactionType = "buy-in" | "cash-out" | "refund";
export type PaymentMethod = "cash" | "card" | "pix" | "voucher";

export type Transaction = {
  id: string;
  player_id: string;
  type: TransactionType;
  chips: number;
  payment: number;
  method: PaymentMethod;
  created_at: string;
};