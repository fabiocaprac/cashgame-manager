import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Transaction } from "@/types";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface TransactionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
  playerName: string;
  onTransactionDeleted?: () => void;
}

export function TransactionHistory({
  open,
  onOpenChange,
  transactions,
  playerName,
  onTransactionDeleted,
}: TransactionHistoryProps) {
  const { toast } = useToast();

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso",
      });

      if (onTransactionDeleted) {
        onTransactionDeleted();
      }
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir transação",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Histórico de Transações - {playerName}</DialogTitle>
          <DialogDescription>
            Registro completo de compras, devoluções e pagamentos
          </DialogDescription>
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
                <th className="text-right py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-white/10">
                  <td className="py-3 px-4">
                    {format(new Date(transaction.created_at), "dd/MM/yyyy, HH:mm:ss")}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.type === "buy-in" ? "Compra" : "Devolução"}
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
                      : "PIX"}
                  </td>
                  <td className="text-right py-3 px-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/90" />
                    </Button>
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