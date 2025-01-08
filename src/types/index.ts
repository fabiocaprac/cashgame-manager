export type Player = {
  id: string;
  name: string;
  purchases: number; // COMPRAS
  returns: number;   // DEVOLUÇÕES
  cashPayments: number; // DN
  cardPayments: number; // CC
  pixPayments: number;  // PIX
  finalBalance: number; // SALDO FINAL
};

export type Transaction = {
  id: string;
  playerId: string;
  type: "buy-in" | "cash-out";
  chips: number;
  payment: number;
  method: "cash" | "card" | "pix";
  timestamp: Date;
};

export type PaymentMethod = "cash" | "card" | "pix";