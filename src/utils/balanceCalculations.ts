import { Player, Transaction } from "@/types";

export const calculatePlayerBalance = (player: Player): number => {
  // Purchases are negative (money spent)
  const purchasesTotal = -player.purchases;
  
  // Returns are positive (money received)
  const returnsTotal = player.returns;
  
  // Payment methods are positive (money received)
  const paymentsTotal = player.cashPayments + player.cardPayments + player.pixPayments;
  
  // Final balance = Returns - Purchases + All Payments
  return returnsTotal + purchasesTotal + paymentsTotal;
};

export const calculateTransactionImpact = (transaction: Transaction): number => {
  if (transaction.type === "buy-in") {
    // Buy-in reduces balance (negative impact)
    return -transaction.chips;
  } else if (transaction.type === "cash-out") {
    // Cash-out increases balance (positive impact)
    return transaction.chips;
  }
  return 0;
};