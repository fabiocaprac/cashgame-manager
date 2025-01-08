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
      chipsInHand: 0,
      debits: 0,
      credits: 0,
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
        const newChipsInHand =
          values.type === "buy-in"
            ? p.chipsInHand + values.chips
            : values.type === "cash-out"
            ? p.chipsInHand - values.chips
            : p.chipsInHand;

        const newDebits =
          values.type === "buy-in" ? p.debits + values.payment : p.debits;

        const newCredits =
          values.type === "cash-out" ? p.credits + values.payment : p.credits;

        return {
          ...p,
          chipsInHand: newChipsInHand,
          debits: newDebits,
          credits: newCredits,
          finalBalance: newChipsInHand - newDebits + newCredits,
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

  const totalChipsInPlay = players.reduce((sum, p) => sum + p.chipsInHand, 0);
  const totalPendingDebits = players.reduce((sum, p) => sum + p.debits, 0);
  const totalPendingCredits = players.reduce((sum, p) => sum + p.credits, 0);
  const totalFinalBalance =
    totalChipsInPlay - totalPendingDebits + totalPendingCredits;

  const movements = ["cash", "card", "pix", "voucher"].map((method) => {
    const methodTransactions = transactions.filter((t) => t.method === method);
    const received = methodTransactions.reduce(
      (sum, t) => (t.type === "buy-in" ? sum + t.payment : sum),
      0
    );
    const paid = methodTransactions.reduce(
      (sum, t) => (t.type === "cash-out" ? sum + t.payment : sum),
      0
    );
    return {
      method: method as Transaction["method"],
      received,
      paid,
      balance: received - paid,
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
        chipsInPlay={totalChipsInPlay}
        pendingDebits={totalPendingDebits}
        pendingCredits={totalPendingCredits}
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