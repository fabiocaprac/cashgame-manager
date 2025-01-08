import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Transaction } from "@/types";
import { format } from "date-fns";

interface TransactionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
  playerName: string;
}

export function TransactionHistory({
  open,
  onOpenChange,
  transactions,
  playerName,
}: TransactionHistoryProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Histórico de Transações - {playerName}</DialogTitle>
        </DialogHeader>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4">Data</th>
                <th className="text-left py-3 px-4">Tipo</th>
                <th className="text-right py-3 px-4">Fichas</th>
                <th className="text-right py-3 px-4">Pagamento</th>
                <th className="text-left py-3 px-4">Método</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-white/10">
                  <td className="py-3 px-4">
                    {format(transaction.timestamp, "dd/MM/yyyy, HH:mm:ss")}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.type === "buy-in"
                      ? "Compra"
                      : transaction.type === "cash-out"
                      ? "Saída"
                      : "Devolução"}
                  </td>
                  <td className="text-right py-3 px-4">
                    R$ {transaction.chips.toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-4">
                    R$ {transaction.payment.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.method === "cash"
                      ? "Dinheiro"
                      : transaction.method === "card"
                      ? "Cartão"
                      : transaction.method === "pix"
                      ? "PIX"
                      : "Vale"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}