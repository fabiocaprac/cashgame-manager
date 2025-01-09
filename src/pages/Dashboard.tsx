import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, List, History } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function Dashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Fetch open registers
  const { data: openGames = [] } = useQuery({
    queryKey: ["openRegisters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("open_cashier")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch closed registers
  const { data: closedGames = [] } = useQuery({
    queryKey: ["closedRegisters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("closed_cashier")
        .select("*")
        .order("closed_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create New Game Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <h2 className="text-2xl font-semibold flex items-center">
              <Plus className="h-6 w-6 mr-2" />
              Novo Caixa
            </h2>
            <p className="text-muted-foreground">
              Criar um novo caixa para gerenciar jogadores e transações.
            </p>
            <Button className="w-full" onClick={() => navigate("/new-game")}>
              Criar Novo Caixa
            </Button>
          </div>

          {/* Open Games Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <h2 className="text-2xl font-semibold flex items-center">
              <List className="h-6 w-6 mr-2" />
              Caixas Abertos
            </h2>
            <div className="space-y-2">
              {openGames.length === 0 ? (
                <p className="text-muted-foreground">Nenhum caixa aberto.</p>
              ) : (
                openGames.map((game) => (
                  <Button
                    key={game.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(`/games/${game.id}`)}
                  >
                    <span className="truncate">
                      {game.name || format(new Date(game.created_at), "dd/MM/yyyy")}
                    </span>
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Closed Games Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <h2 className="text-2xl font-semibold flex items-center">
              <History className="h-6 w-6 mr-2" />
              Últimos Caixas Fechados
            </h2>
            <div className="space-y-2">
              {closedGames.length === 0 ? (
                <p className="text-muted-foreground">Nenhum caixa fechado.</p>
              ) : (
                closedGames.map((game) => (
                  <Button
                    key={game.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(`/games/${game.id}`)}
                  >
                    <span className="truncate">
                      {game.name || format(new Date(game.created_at), "dd/MM/yyyy")}
                    </span>
                  </Button>
                ))
              )}
            </div>
            {closedGames.length > 0 && (
              <Button
                variant="link"
                className="w-full"
                onClick={() => navigate("/closed-games")}
              >
                Ver todos os caixas fechados
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}