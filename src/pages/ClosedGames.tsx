import { Button } from "@/components/ui/button";
import { ClosedGamesTable } from "@/components/ClosedGamesTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ClosedGames() {
  const navigate = useNavigate();

  const { data: closedGames = [] } = useQuery({
    queryKey: ["closedGames"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("closed_cashier")
        .select("*")
        .order("closed_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-4xl font-bold">Caixas Fechados</h1>
      </div>

      <ClosedGamesTable games={closedGames} />
    </div>
  );
}