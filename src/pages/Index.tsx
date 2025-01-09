import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CashGameSummary } from "@/components/CashGameSummary";
import { PlayerTable } from "@/components/PlayerTable";
import { TransactionDialog } from "@/components/TransactionDialog";
import { TransactionHistory } from "@/components/TransactionHistory";
import { PaymentMethod } from "@/types";
import { PlusCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGame } from "@/components/game/GameProvider";
import { ClosedGamesTable } from "@/components/ClosedGamesTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { signOut } = useAuth();
  const { game, players, transactions, createGame, addPlayer, addTransaction } = useGame();
  const [newPlayerName, setNewPlayerName] = useState("");
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [newGameName, setNewGameName] = useState("");
  const [newGameNotes, setNewGameNotes] = useState("");

  // Fetch closed games
  const { data: closedGames = [] } = useQuery({
    queryKey: ["closedGames"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .not("closed_at", "is", null)
        .order("closed_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    addPlayer(newPlayerName);
    setNewPlayerName("");
  };

  const handleViewHistory = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setHistoryDialogOpen(true);
  };

  const handleCreateGame = async () => {
    await createGame(newGameName, newGameNotes);
    setNewGameName("");
    setNewGameNotes("");
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
  const totalFinalBalance = -totalPurchases + totalReturns + totalCashPayments + totalCardPayments + totalPixPayments;

  const movements: { method: PaymentMethod; received: number; paid: number; balance: number; }[] = 
    (["cash", "card", "pix", "voucher"] as PaymentMethod[]).map((method) => {
      const methodTransactions = transactions.filter((t) => t.method === method);
      const received = methodTransactions.reduce(
        (sum, t) => sum + t.payment,
        0
      );
      return {
        method,
        received,
        paid: 0,
        balance: received,
      };
    });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Cash Game</h1>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>

      {!game ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Nenhum jogo em andamento</h2>
          <div className="w-full max-w-md space-y-4">
            <Input
              placeholder="Nome do jogo"
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
            />
            <Textarea
              placeholder="Observações"
              value={newGameNotes}
              onChange={(e) => setNewGameNotes(e.target.value)}
            />
            <Button onClick={handleCreateGame} className="w-full">
              Iniciar Novo Jogo
            </Button>
          </div>
          
          {closedGames.length > 0 && (
            <div className="w-full mt-8">
              <h3 className="text-xl font-semibold mb-4">Jogos Fechados</h3>
              <ClosedGamesTable games={closedGames} />
            </div>
          )}
        </div>
      ) : (
        <>
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
            onSubmit={addTransaction}
          />

          {selectedPlayer && (
            <TransactionHistory
              open={historyDialogOpen}
              onOpenChange={setHistoryDialogOpen}
              transactions={playerTransactions}
              playerName={selectedPlayer.name}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Index;