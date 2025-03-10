
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Player, Transaction, TransactionType, PaymentMethod } from "@/types";

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
  refreshData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams();
  const [game, setGame] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameClosed, setIsGameClosed] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      createGameSession();
      fetchGameData(params.id);
    } else {
      setIsLoading(false);
    }
  }, [params.id]);

  const createGameSession = async () => {
    try {
      const { data: session, error } = await supabase
        .from("game_sessions")
        .insert([
          {
            is_active: true,
            start_time: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setCurrentSession(session.id);
    } catch (error) {
      console.error("Error creating game session:", error);
    }
  };

  const fetchGameData = async (gameId: string) => {
    try {
      const { data: gameData, error: gameError } = await supabase
        .from("open_cashier")
        .select("*")
        .eq("id", gameId)
        .single();

      if (gameError) throw gameError;
      setGame(gameData);

      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("game_id", gameId);

      if (playersError) throw playersError;

      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .in(
          "player_id",
          playersData.map((p) => p.id)
        );

      if (transactionsError) throw transactionsError;

      const typedTransactions = transactionsData.map(t => ({
        ...t,
        type: t.type as TransactionType,
        method: t.method as PaymentMethod,
        session_id: currentSession || ""
      }));

      const enhancedPlayers = playersData.map((player) => {
        const playerTransactions = typedTransactions.filter(
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
      setTransactions(typedTransactions);
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
      const { error } = await supabase.rpc('close_game', {
        game_id: game.id,
        closed_at: new Date().toISOString()
      });

      if (error) throw error;

      // Update game session
      if (currentSession) {
        await supabase
          .from("game_sessions")
          .update({
            end_time: new Date().toISOString(),
            is_active: false
          })
          .eq("id", currentSession);
      }

      setIsGameClosed(true);
      navigate("/");
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
    if (!game || !currentSession) return;

    try {
      const { data: transaction, error } = await supabase
        .from("transactions")
        .insert([{
          player_id: values.player_id,
          type: values.type as TransactionType,
          chips: values.chips,
          payment: values.payment,
          method: values.method as PaymentMethod,
          session_id: currentSession,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      setTransactions([...transactions, transaction as Transaction]);
      await fetchGameData(game.id); // Pass the game ID explicitly
    } catch (error: any) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar transação",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    if (params.id) {
      await fetchGameData(params.id);
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
        refreshData,
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
