
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Transaction, TransactionType, PaymentMethod } from "@/types";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

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
  playerName,
  onTransactionDeleted,
}: TransactionHistoryProps) {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("player_id", transactions[0]?.player_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Convert the raw data to properly typed Transaction objects
      const typedTransactions: Transaction[] = (data || []).map(t => ({
        ...t,
        type: t.type as TransactionType, // Explicitly type as TransactionType
        method: t.method as PaymentMethod, // Explicitly type as PaymentMethod
        chips: Number(t.chips),
        payment: Number(t.payment)
      }));

      setTransactions(typedTransactions);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar transações",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open && transactions[0]?.player_id) {
      fetchTransactions();
    }
  }, [open]);

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
      
      // Atualiza a lista local após deletar
      setTransactions(transactions.filter(t => t.id !== transactionId));
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
                    {transaction.type === "buy-in" ? "Compra" : 
                     transaction.type === "cash-out" ? "Saída" : "Devolução"}
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
