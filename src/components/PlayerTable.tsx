import { Player } from "@/types";
import { History } from "lucide-react";
import { Button } from "./ui/button";

interface PlayerTableProps {
  players: Player[];
  onViewHistory: (playerId: string) => void;
}

export function PlayerTable({ players, onViewHistory }: PlayerTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-4 px-4">Jogador</th>
            <th className="text-right py-4 px-4">Fichas Compradas (Buy-in)</th>
            <th className="text-right py-4 px-4">Fichas Devolvidas (Cash-out)</th>
            <th className="text-right py-4 px-4">Fichas em Mãos</th>
            <th className="text-right py-4 px-4">Saldo Final</th>
            <th className="py-4 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id} className="border-b border-white/10">
              <td className="py-4 px-4">{player.name}</td>
              <td className="text-right py-4 px-4 text-red-500">
                -R$ {player.debits.toFixed(2)}
              </td>
              <td className="text-right py-4 px-4 text-green-500">
                R$ {player.credits.toFixed(2)}
              </td>
              <td className="text-right py-4 px-4">
                R$ {player.chipsInHand.toFixed(2)}
              </td>
              <td className="text-right py-4 px-4">
                R$ {player.finalBalance.toFixed(2)}
              </td>
              <td className="py-4 px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewHistory(player.id)}
                >
                  <History className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}