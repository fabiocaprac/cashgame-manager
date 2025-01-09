import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGame } from "@/components/game/GameProvider";
import { useState } from "react";

export default function NewGame() {
  const { createGame } = useGame();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGame(name, notes);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Novo Jogo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nome do jogo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              placeholder="Observações"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Criar Jogo
          </Button>
        </form>
      </div>
    </div>
  );
}