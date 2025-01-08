export type Player = {
  id: string;
  name: string;
  purchases: number;
  returns: number;
  cashPayments: number;
  cardPayments: number;
  pixPayments: number;
  finalBalance: number;
};

export type Transaction = {
  id: string;
  playerId: string;
  type: "buy-in" | "cash-out";
  chips: number;
  payment: number;
  method: PaymentMethod;
  timestamp: Date;
};

export type PaymentMethod = "cash" | "card" | "pix" | "voucher";