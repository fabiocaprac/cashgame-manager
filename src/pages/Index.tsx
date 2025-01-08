import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CashGameSummary } from "@/components/CashGameSummary";
import { PlayerTable } from "@/components/PlayerTable";
import { TransactionDialog } from "@/components/TransactionDialog";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Player, Transaction } from "@/types";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do jogador",
        variant: "destructive",
      });
      return;
    }

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: newPlayerName,
      purchases: 0,
      returns: 0,
      cashPayments: 0,
      cardPayments: 0,
      pixPayments: 0,
      finalBalance: 0,
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName("");
    toast({
      title: "Sucesso",
      description: "Jogador adicionado com sucesso",
    });
  };

  const handleTransaction = (values: any) => {
    const player = players.find((p) => p.id === values.playerId);
    if (!player) return;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      playerId: values.playerId,
      type: values.type,
      chips: values.chips,
      payment: values.payment,
      method: values.method,
      timestamp: new Date(),
    };

    setTransactions([...transactions, transaction]);

    const updatedPlayers = players.map((p) => {
      if (p.id === values.playerId) {
        let newPurchases = p.purchases;
        let newReturns = p.returns;
        let newCashPayments = p.cashPayments;
        let newCardPayments = p.cardPayments;
        let newPixPayments = p.pixPayments;

        // Update chip transactions
        if (values.type === "buy-in") {
          newPurchases += values.chips;
        } else if (values.type === "cash-out") {
          newReturns += values.chips;
        }

        // Update payment method totals
        if (values.payment > 0) {
          switch (values.method) {
            case "cash":
              newCashPayments += values.payment;
              break;
            case "card":
              newCardPayments += values.payment;
              break;
            case "pix":
              newPixPayments += values.payment;
              break;
          }
        }

        // Calculate final balance
        const finalBalance = (newPurchases - newReturns) + 
                           newCashPayments + 
                           newCardPayments + 
                           newPixPayments;

        return {
          ...p,
          purchases: newPurchases,
          returns: newReturns,
          cashPayments: newCashPayments,
          cardPayments: newCardPayments,
          pixPayments: newPixPayments,
          finalBalance,
        };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    setTransactionDialogOpen(false);
    toast({
      title: "Sucesso",
      description: "Transação registrada com sucesso",
    });
  };

  const handleViewHistory = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setHistoryDialogOpen(true);
  };

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  const playerTransactions = transactions.filter(
    (t) => t.playerId === selectedPlayerId
  );

  const totalPurchases = players.reduce((sum, p) => sum + p.purchases, 0);
  const totalReturns = players.reduce((sum, p) => sum + p.returns, 0);
  const totalCashPayments = players.reduce((sum, p) => sum + p.cashPayments, 0);
  const totalCardPayments = players.reduce((sum, p) => sum + p.cardPayments, 0);
  const totalPixPayments = players.reduce((sum, p) => sum + p.pixPayments, 0);
  const totalFinalBalance = players.reduce((sum, p) => sum + p.finalBalance, 0);

  const movements = ["cash", "card", "pix"].map((method) => {
    const methodTransactions = transactions.filter((t) => t.method === method);
    const received = methodTransactions.reduce(
      (sum, t) => sum + t.payment,
      0
    );
    return {
      method,
      received,
      paid: 0, // We don't track outgoing payments in this version
      balance: received,
    };
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">Cash Game</h1>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Nome do novo jogador"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleAddPlayer} size="icon">
          <PlusCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          className="ml-auto"
          onClick={() => setTransactionDialogOpen(true)}
        >
          Nova Transação
        </Button>
      </div>

      <div className="glass-card p-6">
        <PlayerTable players={players} onViewHistory={handleViewHistory} />
      </div>

      <CashGameSummary
        chipsInPlay={totalPurchases - totalReturns}
        pendingDebits={totalPurchases}
        pendingCredits={totalReturns}
        finalBalance={totalFinalBalance}
        movements={movements}
      />

      <TransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        players={players}
        onSubmit={handleTransaction}
      />

      {selectedPlayer && (
        <TransactionHistory
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          transactions={playerTransactions}
          playerName={selectedPlayer.name}
        />
      )}
    </div>
  );
};

export default Index;