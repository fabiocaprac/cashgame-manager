import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface ClosedGame {
  id: string;
  name: string | null;
  notes: string | null;
  created_at: string;
  closed_at: string | null;
}

interface ClosedGamesTableProps {
  games: ClosedGame[];
}

export function ClosedGamesTable({ games }: ClosedGamesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Data de Criação</TableHead>
          <TableHead>Data de Fechamento</TableHead>
          <TableHead>Observações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {games.map((game) => (
          <TableRow key={game.id}>
            <TableCell>{game.name || "Sem nome"}</TableCell>
            <TableCell>
              {format(new Date(game.created_at), "dd/MM/yyyy HH:mm")}
            </TableCell>
            <TableCell>
              {game.closed_at
                ? format(new Date(game.closed_at), "dd/MM/yyyy HH:mm")
                : "-"}
            </TableCell>
            <TableCell>{game.notes || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}