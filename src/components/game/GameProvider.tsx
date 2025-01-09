import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Player, Transaction } from "@/types";

interface GameContextType {
  game: any;
  players: Player[];
  transactions: Transaction[];
  isLoading: boolean;
  isGameClosed: boolean;
  createGame: (name: string, notes?: string) => Promise<void>;
  closeGame: () => Promise<void>;
  addPlayer: (name: string) => Promise<void>;
  addTransaction: (values: any) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameClosed, setIsGameClosed] = useState(false);

  const gameId = window.location.pathname.split("/").pop();

  useEffect(() => {
    if (gameId) {
      fetchGameData();
    } else {
      setIsLoading(false);
    }
  }, [gameId]);

  const fetchGameData = async () => {
    try {
      // Fetch game data
      const { data: gameData, error: gameError } = await supabase
        .from("open_cashier")
        .select("*")
        .eq("id", gameId)
        .single();

      if (gameError) throw gameError;
      setGame(gameData);

      // Fetch players with game_id filter
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("game_id", gameId);

      if (playersError) throw playersError;

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .in(
          "player_id",
          playersData.map((p) => p.id)
        );

      if (transactionsError) throw transactionsError;

      const enhancedPlayers = playersData.map((player) => {
        const playerTransactions = transactionsData.filter(
          (t) => t.player_id === player.id
        );
        const purchases = playerTransactions
          .filter((t) => t.type === "buy-in")
          .reduce((sum, t) => sum + Number(t.chips), 0);
        const returns = playerTransactions
          .filter((t) => t.type === "cash-out" || t.type === "refund")
          .reduce((sum, t) => sum + Number(t.chips), 0);
        const cashPayments = playerTransactions
          .filter((t) => t.method === "cash")
          .reduce((sum, t) => sum + Number(t.payment), 0);
        const cardPayments = playerTransactions
          .filter((t) => t.method === "card")
          .reduce((sum, t) => sum + Number(t.payment), 0);
        const pixPayments = playerTransactions
          .filter((t) => t.method === "pix")
          .reduce((sum, t) => sum + Number(t.payment), 0);

        return {
          ...player,
          purchases,
          returns,
          cashPayments,
          cardPayments,
          pixPayments,
        };
      });

      setPlayers(enhancedPlayers);
      setTransactions(transactionsData);
    } catch (error: any) {
      console.error("Error fetching game data:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar dados do jogo",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const createGame = async (name: string, notes?: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      const { data: game, error: gameError } = await supabase
        .from("open_cashier")
        .insert([
          {
            name,
            notes,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (gameError) throw gameError;

      navigate(`/game/${game.id}`);
    } catch (error: any) {
      console.error("Error creating game:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar jogo",
        variant: "destructive",
      });
    }
  };

  const closeGame = async () => {
    if (!game) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      // Move game to closed_cashier
      const { error: closeError } = await supabase
        .from("closed_cashier")
        .insert([
          {
            ...game,
            closed_at: new Date().toISOString(),
          },
        ]);

      if (closeError) throw closeError;

      // Move transactions to closed_cashier_transactions
      const { error: transactionsError } = await supabase
        .from("closed_cashier_transactions")
        .insert(transactions.map((t) => ({
          ...t,
          closed_register_id: game.id,
        })));

      if (transactionsError) throw transactionsError;

      // Delete original game and transactions
      await supabase.from("transactions").delete().in(
        "player_id",
        players.map((p) => p.id)
      );
      await supabase.from("players").delete().eq("game_id", game.id);
      await supabase.from("open_cashier").delete().eq("id", game.id);

      setIsGameClosed(true);
    } catch (error: any) {
      console.error("Error closing game:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao fechar jogo",
        variant: "destructive",
      });
    }
  };

  const addPlayer = async (name: string) => {
    if (!game) return;

    try {
      const { data: player, error } = await supabase
        .from("players")
        .insert([
          {
            name,
            game_id: game.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setPlayers([...players, { 
        ...player, 
        purchases: 0, 
        returns: 0, 
        cashPayments: 0, 
        cardPayments: 0, 
        pixPayments: 0 
      }]);
    } catch (error: any) {
      console.error("Error adding player:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar jogador",
        variant: "destructive",
      });
    }
  };

  const addTransaction = async (values: any) => {
    if (!game) return;

    try {
      const { data: transaction, error } = await supabase
        .from("transactions")
        .insert([{
          player_id: values.player_id,
          type: values.type as "buy-in" | "cash-out" | "refund",
          chips: values.chips,
          payment: values.payment,
          method: values.method,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      setTransactions([...transactions, transaction as Transaction]);
      await fetchGameData(); // Refresh all data to ensure consistency
    } catch (error: any) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar transação",
        variant: "destructive",
      });
    }
  };

  return (
    <GameContext.Provider
      value={{
        game,
        players,
        transactions,
        isLoading,
        isGameClosed,
        createGame,
        closeGame,
        addPlayer,
        addTransaction,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}