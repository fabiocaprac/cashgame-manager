import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/components/game/GameProvider";
import { ArrowLeft } from "lucide-react";

export default function NewGame() {
  const navigate = useNavigate();
  const { createGame } = useGame();
  const [newGameName, setNewGameName] = useState("");
  const [newGameNotes, setNewGameNotes] = useState("");

  const handleCreateGame = async () => {
    const game = await createGame(newGameName, newGameNotes);
    navigate(`/games/${game.id}`);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-4xl font-bold">Novo Caixa</h1>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <Input
          placeholder="Nome do caixa"
          value={newGameName}
          onChange={(e) => setNewGameName(e.target.value)}
        />
        <Textarea
          placeholder="Observações"
          value={newGameNotes}
          onChange={(e) => setNewGameNotes(e.target.value)}
        />
        <Button onClick={handleCreateGame} className="w-full">
          Criar Novo Caixa
        </Button>
      </div>
    </div>
  );
}