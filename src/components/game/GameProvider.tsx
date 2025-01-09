import { createContext, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../auth/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Player, Transaction } from "@/types";
import { Database } from "@/integrations/supabase/types";

type Tables = Database['public']['Tables'];
type Game = Tables['games']['Row'];

interface GameContextType {
  game: Game | null;
  players: Player[];
  transactions: Transaction[];
  createGame: (name?: string, notes?: string) => Promise<Game>;
  addPlayer: (name: string) => Promise<void>;
  addTransaction: (values: any) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  // Fetch current game
  const { data: game } = useQuery({
    queryKey: ["game", currentGameId],
    queryFn: async () => {
      if (!currentGameId) return null;
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", currentGameId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentGameId,
  });

  // Fetch players for current game
  const { data: rawPlayers = [] } = useQuery({
    queryKey: ["players", currentGameId],
    queryFn: async () => {
      if (!currentGameId) return [];
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("game_id", currentGameId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentGameId,
  });

  // Fetch transactions for current game
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", currentGameId],
    queryFn: async () => {
      if (!currentGameId) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*, player:players(game_id)")
        .eq("player.game_id", currentGameId);
      
      if (error) throw error;
      return data.map((transaction: Tables['transactions']['Row']) => ({
        id: transaction.id,
        playerId: transaction.player_id,
        type: transaction.type as Transaction["type"],
        chips: transaction.chips,
        payment: transaction.payment,
        method: transaction.method as Transaction["method"],
        timestamp: new Date(transaction.created_at),
      }));
    },
    enabled: !!currentGameId,
  });

  // Calculate player balances from transactions
  const players = rawPlayers.map((player) => {
    const playerTransactions = transactions.filter(t => t.playerId === player.id);
    
    const purchases = playerTransactions
      .filter(t => t.type === "buy-in")
      .reduce((sum, t) => sum + t.chips, 0);
    
    const returns = playerTransactions
      .filter(t => t.type === "cash-out")
      .reduce((sum, t) => sum + t.chips, 0);
    
    const cashPayments = playerTransactions
      .filter(t => t.method === "cash")
      .reduce((sum, t) => sum + t.payment, 0);
    
    const cardPayments = playerTransactions
      .filter(t => t.method === "card")
      .reduce((sum, t) => sum + t.payment, 0);
    
    const pixPayments = playerTransactions
      .filter(t => t.method === "pix")
      .reduce((sum, t) => sum + t.payment, 0);

    return {
      id: player.id,
      name: player.name,
      purchases,
      returns,
      cashPayments,
      cardPayments,
      pixPayments,
      finalBalance: -purchases + returns + cashPayments + cardPayments + pixPayments,
    };
  });

  // Create new game
  const createGameMutation = useMutation({
    mutationFn: async (values: { name?: string; notes?: string } = {}) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("games")
        .insert([{ 
          created_by: user.id,
          name: values.name || null,
          notes: values.notes || null,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setCurrentGameId(data.id);
      queryClient.invalidateQueries({ queryKey: ["game"] });
      toast({
        title: "Sucesso",
        description: "Novo jogo criado com sucesso",
      });
    },
  });

  // Add new player
  const addPlayerMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!currentGameId) throw new Error("No game selected");
      
      const { error } = await supabase
        .from("players")
        .insert([{ game_id: currentGameId, name }])
        .select()
        .single();
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast({
        title: "Sucesso",
        description: "Jogador adicionado com sucesso",
      });
    },
  });

  // Add new transaction
  const addTransactionMutation = useMutation({
    mutationFn: async (values: {
      playerId: string;
      type: "buy-in" | "cash-out" | "refund";
      chips: number;
      payment: number;
      method: "cash" | "card" | "pix" | "voucher";
    }) => {
      const { error } = await supabase
        .from("transactions")
        .insert([{
          player_id: values.playerId,
          type: values.type,
          chips: values.chips,
          payment: values.payment,
          method: values.method,
        }])
        .select()
        .single();
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Sucesso",
        description: "Transação registrada com sucesso",
      });
    },
  });

  return (
    <GameContext.Provider
      value={{
        game,
        players,
        transactions,
        createGame: (name?: string, notes?: string) => 
          createGameMutation.mutateAsync({ name, notes }),
        addPlayer: (name) => addPlayerMutation.mutateAsync(name),
        addTransaction: (values) => addTransactionMutation.mutateAsync(values),
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};