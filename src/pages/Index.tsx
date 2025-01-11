import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CashGameSummary } from "@/components/CashGameSummary";
import { PlayerTable } from "@/components/PlayerTable";
import { TransactionDialog } from "@/components/TransactionDialog";
import { TransactionHistory } from "@/components/TransactionHistory";
import { CloseGameDialog } from "@/components/CloseGameDialog";
import { EditAuthDialog } from "@/components/EditAuthDialog";
import { PaymentMethod } from "@/types";
import { PlusCircle, LogOut, History, XCircle, ArrowLeft, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGame } from "@/components/game/GameProvider";
import { ClosedGamesTable } from "@/components/ClosedGamesTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const Index = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { 
    game, 
    players, 
    transactions, 
    createGame, 
    closeGame,
    addPlayer, 
    addTransaction,
    isLoading,
    isGameClosed,
    refreshData
  } = useGame();
  
  const [newPlayerName, setNewPlayerName] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [closeGameDialogOpen, setCloseGameDialogOpen] = useState(false);
  const [editAuthDialogOpen, setEditAuthDialogOpen] = useState(false);
  const [isEditAuthorized, setIsEditAuthorized] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [newGameName, setNewGameName] = useState("");
  const [newGameNotes, setNewGameNotes] = useState("");

  const handleSearch = async (search: string) => {
    setNewPlayerName(search);
    
    if (search.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('players')
        .select('name, id')
        .ilike('name', `%${search}%`)
        .limit(5);

      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error: any) {
      console.error('Error searching players:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar jogadores",
        variant: "destructive",
      });
    }
  };

  const handleSelectPlayer = (name: string) => {
    setNewPlayerName(name);
    setSearchOpen(false);
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    if (isGameClosed) {
      toast({
        title: "Erro",
        description: "Não é possível adicionar jogadores em um caixa fechado",
        variant: "destructive",
      });
      return;
    }
    addPlayer(newPlayerName);
    setNewPlayerName("");
    setSearchResults([]);
  };

  const handleCreatePlayerRecord = async () => {
    if (!newPlayerName.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([
          { 
            name: newPlayerName,
            // Usando um ID de jogo nulo para indicar que é apenas um registro de jogador
            game_id: '00000000-0000-0000-0000-000000000000'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Jogador registrado com sucesso no banco de dados",
      });
      
      setNewPlayerName("");
      setSearchResults([]);
    } catch (error: any) {
      console.error('Error creating player:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar jogador",
        variant: "destructive",
      });
    }
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

  const handleCloseGame = async () => {
    await closeGame();
    navigate("/");
    toast({
      title: "Sucesso",
      description: "Caixa encerrado com sucesso",
    });
  };

  const handleNewTransaction = () => {
    if (isGameClosed && !isEditAuthorized) {
      setEditAuthDialogOpen(true);
      return;
    }
    setTransactionDialogOpen(true);
  };

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  const playerTransactions = transactions.filter(
    (t) => t.player_id === selectedPlayerId
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Dashboard
          </Button>
          <h1 className="text-4xl font-bold">Cash Game</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
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
        </div>
      ) : (
        <>
          <div className="flex gap-4 items-center">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <div className="flex-1 max-w-xs">
                  <Input
                    placeholder="Nome do novo jogador"
                    value={newPlayerName}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full"
                    disabled={isGameClosed}
                  />
                </div>
              </PopoverTrigger>
              {searchResults.length > 0 && (
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar jogador..." />
                    <CommandEmpty>Nenhum jogador encontrado.</CommandEmpty>
                    <CommandGroup>
                      {searchResults.map((player) => (
                        <CommandItem
                          key={player.id}
                          onSelect={() => handleSelectPlayer(player.name)}
                        >
                          {player.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              )}
            </Popover>
            <Button 
              onClick={handleAddPlayer} 
              size="icon"
              disabled={isGameClosed}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleCreatePlayerRecord}
              size="icon"
              variant="outline"
              disabled={!newPlayerName.trim()}
              title="Registrar novo jogador no banco de dados"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            {!isGameClosed && (
              <Button
                variant="destructive"
                onClick={() => setCloseGameDialogOpen(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Encerrar Caixa
              </Button>
            )}
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
            isGameClosed={isGameClosed}
          />

          <CloseGameDialog
            open={closeGameDialogOpen}
            onOpenChange={setCloseGameDialogOpen}
            onConfirm={handleCloseGame}
          />

          <EditAuthDialog
            open={editAuthDialogOpen}
            onOpenChange={setEditAuthDialogOpen}
            onConfirm={() => setIsEditAuthorized(true)}
          />

          {selectedPlayer && (
            <TransactionHistory
              open={historyDialogOpen}
              onOpenChange={setHistoryDialogOpen}
              transactions={playerTransactions}
              playerName={selectedPlayer.name}
              onTransactionDeleted={refreshData}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Index;
