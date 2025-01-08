export type Player = {
  id: string;
  name: string;
  chipsInHand: number;
  debits: number;
  credits: number;
  finalBalance: number;
};

export type Transaction = {
  id: string;
  playerId: string;
  type: "buy-in" | "cash-out" | "refund";
  chips: number;
  payment: number;
  method: "cash" | "card" | "pix" | "voucher";
  timestamp: Date;
};

export type PaymentMethod = "cash" | "card" | "pix" | "voucher";