import { Player } from "@/types";
import { History } from "lucide-react";
import { Button } from "./ui/button";
import { calculatePlayerBalance } from "@/utils/balanceCalculations";

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
            <th className="text-right py-4 px-4">Compras</th>
            <th className="text-right py-4 px-4">Devoluções</th>
            <th className="text-right py-4 px-4">DN</th>
            <th className="text-right py-4 px-4">CC</th>
            <th className="text-right py-4 px-4">PIX</th>
            <th className="text-right py-4 px-4">Saldo Final</th>
            <th className="py-4 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const finalBalance = calculatePlayerBalance(player);
            return (
              <tr key={player.id} className="border-b border-white/10">
                <td className="py-4 px-4">{player.name}</td>
                <td className="text-right py-4 px-4 text-destructive">
                  -R$ {player.purchases.toFixed(2)}
                </td>
                <td className="text-right py-4 px-4 text-green-500">
                  R$ {player.returns.toFixed(2)}
                </td>
                <td className="text-right py-4 px-4">
                  R$ {player.cashPayments.toFixed(2)}
                </td>
                <td className="text-right py-4 px-4">
                  R$ {player.cardPayments.toFixed(2)}
                </td>
                <td className="text-right py-4 px-4">
                  R$ {player.pixPayments.toFixed(2)}
                </td>
                <td className={`text-right py-4 px-4 ${
                  finalBalance >= 0 ? "text-green-500" : "text-destructive"
                }`}>
                  {finalBalance >= 0 ? "+" : "-"}R$ {Math.abs(finalBalance).toFixed(2)}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}