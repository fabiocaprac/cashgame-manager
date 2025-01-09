import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CashGameSummary } from "@/components/CashGameSummary";
import { PlayerTable } from "@/components/PlayerTable";
import { TransactionHistory } from "@/components/TransactionHistory";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { PaymentMethod, Player, Transaction } from "@/types";

export default function ClosedGameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const { data: game } = useQuery({
    queryKey: ["closedGame", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("closed_cashier")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: players = [] } = useQuery({
    queryKey: ["closedGamePlayers", id],
    queryFn: async () => {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("closed_cashier_transactions")
        .select("*")
        .eq("closed_register_id", id);

      if (transactionsError) throw transactionsError;

      // Group transactions by player_id to create player summaries
      const playerSummaries = new Map<string, {
        id: string;
        name: string;
        purchases: number;
        returns: number;
        cashPayments: number;
        cardPayments: number;
        pixPayments: number;
      }>();

      transactionsData.forEach((transaction) => {
        const playerId = transaction.player_id;
        const current = playerSummaries.get(playerId) || {
          id: playerId,
          name: "", // We'll update this later
          purchases: 0,
          returns: 0,
          cashPayments: 0,
          cardPayments: 0,
          pixPayments: 0,
        };

        if (transaction.type === "buy-in") {
          current.purchases += Number(transaction.chips);
        } else {
          current.returns += Number(transaction.chips);
        }

        switch (transaction.method) {
          case "cash":
            current.cashPayments += Number(transaction.payment);
            break;
          case "card":
            current.cardPayments += Number(transaction.payment);
            break;
          case "pix":
            current.pixPayments += Number(transaction.payment);
            break;
        }

        playerSummaries.set(playerId, current);
      });

      // Get player names
      const playerIds = Array.from(playerSummaries.keys());
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("id, name")
        .in("id", playerIds);

      if (playersError) throw playersError;

      // Update player names in summaries
      playersData.forEach((player) => {
        const summary = playerSummaries.get(player.id);
        if (summary) {
          summary.name = player.name;
        }
      });

      return Array.from(playerSummaries.values()) as Player[];
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["closedGameTransactions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("closed_cashier_transactions")
        .select("*")
        .eq("closed_register_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data as Transaction[];
    },
  });

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  const playerTransactions = transactions.filter(
    (t) => t.player_id === selectedPlayerId
  );

  const totalPurchases = players.reduce((sum, p) => sum + p.purchases, 0);
  const totalReturns = players.reduce((sum, p) => sum + p.returns, 0);
  const totalCashPayments = players.reduce((sum, p) => sum + p.cashPayments, 0);
  const totalCardPayments = players.reduce((sum, p) => sum + p.cardPayments, 0);
  const totalPixPayments = players.reduce((sum, p) => sum + p.pixPayments, 0);
  const totalFinalBalance =
    -totalPurchases + totalReturns + totalCashPayments + totalCardPayments + totalPixPayments;

  const movements: {
    method: PaymentMethod;
    received: number;
    paid: number;
    balance: number;
  }[] = (["cash", "card", "pix", "voucher"] as PaymentMethod[]).map((method) => {
    const methodTransactions = transactions.filter((t) => t.method === method);
    const received = methodTransactions.reduce((sum, t) => sum + t.payment, 0);
    return {
      method,
      received,
      paid: 0,
      balance: received,
    };
  });

  const handleViewHistory = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setHistoryDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/closed-games")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Caixas Fechados
          </Button>
          <h1 className="text-4xl font-bold">
            Caixa Fechado - {game?.name || "Sem nome"}
          </h1>
        </div>
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
}