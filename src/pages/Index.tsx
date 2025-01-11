import { useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerTable } from "@/components/PlayerTable";
import { TransactionDialog } from "@/components/TransactionDialog";
import { TransactionHistory } from "@/components/TransactionHistory";
import { CashGameSummary } from "@/components/CashGameSummary";
import { CloseGameDialog } from "@/components/CloseGameDialog";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, Search, Plus } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { calculatePlayerBalance } from "@/utils/balanceCalculations";
import { PaymentMethod } from "@/types";

export default function Index() {
  const { game, players, addPlayer, refreshData } = useGame();
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isCloseGameDialogOpen, setIsCloseGameDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();

  const handleViewHistory = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayerName(player.name);
      setSelectedPlayerId(playerId);
    }
  };

  const handleCloseHistory = () => {
    setSelectedPlayerId(null);
  };

  const handleSearch = async (value: string) => {
    if (!value) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .ilike("name", `%${value}%`)
        .is("game_id", null);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      console.error("Error searching players:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao buscar jogadores",
        variant: "destructive",
      });
    }
  };

  const handleSelectPlayer = async (player: any) => {
    try {
      await addPlayer(player.name);
      setIsSearchOpen(false);
      toast({
        title: "Sucesso",
        description: "Jogador adicionado ao jogo",
      });
    } catch (error: any) {
      console.error("Error adding player:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar jogador",
        variant: "destructive",
      });
    }
  };

  const handleCreatePlayerRecord = async () => {
    if (!newPlayerName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do jogador é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("players")
        .insert([{ name: newPlayerName, game_id: null }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Jogador registrado com sucesso no banco de dados",
      });
      
      setNewPlayerName("");
    } catch (error: any) {
      console.error("Error creating player record:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar jogador",
        variant: "destructive",
      });
    }
  };

  const handleCloseGame = async () => {
    try {
      const { error } = await supabase.rpc('close_game', {
        game_id: game?.id,
        closed_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Caixa fechado com sucesso",
      });
    } catch (error: any) {
      console.error("Error closing game:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao fechar o caixa",
        variant: "destructive",
      });
    }
  };

  // Calculate summary data
  const calculateSummaryData = () => {
    const chipsInPlay = players.reduce((sum, player) => sum + calculatePlayerBalance(player), 0);
    const pendingDebits = players.reduce((sum, player) => {
      const balance = calculatePlayerBalance(player);
      return sum + (balance < 0 ? Math.abs(balance) : 0);
    }, 0);
    const pendingCredits = players.reduce((sum, player) => {
      const balance = calculatePlayerBalance(player);
      return sum + (balance > 0 ? balance : 0);
    }, 0);

    const movements = [
      "cash", "card", "pix", "voucher"
    ].map((method) => {
      const methodTransactions = players.flatMap(player => {
        const transactions = [];
        if (player.cashPayments && method === "cash") transactions.push({ amount: player.cashPayments });
        if (player.cardPayments && method === "card") transactions.push({ amount: player.cardPayments });
        if (player.pixPayments && method === "pix") transactions.push({ amount: player.pixPayments });
        return transactions;
      });

      const received = methodTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
      const paid = methodTransactions.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);

      return {
        method: method as PaymentMethod,
        received,
        paid,
        balance: received - paid
      };
    });

    return {
      chipsInPlay,
      pendingDebits,
      pendingCredits,
      finalBalance: chipsInPlay,
      movements
    };
  };

  if (!game) return null;

  const summaryData = calculateSummaryData();

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{game.name}</h1>
        <div className="space-x-2">
          <Button onClick={() => setIsTransactionDialogOpen(true)}>
            Nova Transação
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsCloseGameDialogOpen(true)}
          >
            Fechar Caixa
          </Button>
        </div>
      </div>

      <CashGameSummary {...summaryData} />

      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Nome do jogador"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
          />
          <Button onClick={handleCreatePlayerRecord}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Registro
          </Button>
        </div>
        <Button onClick={() => setIsSearchOpen(true)}>
          <Search className="h-4 w-4 mr-2" />
          Buscar Jogador
        </Button>
      </div>

      <PlayerTable players={players} onViewHistory={handleViewHistory} />

      <TransactionDialog
        open={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
        players={players}
        onSubmit={async (values) => {
          try {
            await supabase.from("transactions").insert([
              {
                player_id: values.player_id,
                type: values.type,
                chips: values.chips,
                payment: values.payment,
                method: values.method,
              },
            ]);
            await refreshData();
          } catch (error: any) {
            console.error("Error adding transaction:", error);
            throw error;
          }
        }}
      />

      <CloseGameDialog
        open={isCloseGameDialogOpen}
        onOpenChange={setIsCloseGameDialogOpen}
        onConfirm={handleCloseGame}
      />

      {selectedPlayerId && (
        <TransactionHistory
          open={!!selectedPlayerId}
          onOpenChange={() => setSelectedPlayerId(null)}
          transactions={[]} // This will be populated by the component itself
          playerName={selectedPlayerName}
          onTransactionDeleted={refreshData}
        />
      )}

      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <Command>
          <CommandInput
            placeholder="Buscar jogador..."
            onValueChange={handleSearch}
          />
          <CommandList>
            <CommandEmpty>Nenhum jogador encontrado.</CommandEmpty>
            <CommandGroup>
              {searchResults.map((player) => (
                <CommandItem
                  key={player.id}
                  onSelect={() => handleSelectPlayer(player)}
                >
                  {player.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}