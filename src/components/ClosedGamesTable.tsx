import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useState } from "react";

interface ClosedGame {
  id: string;
  name: string | null;
  created_at: string;
  closed_at: string;
  last_transaction_at: string | null;
  created_by: string;
}

interface ClosedGamesTableProps {
  games: ClosedGame[];
}

export function ClosedGamesTable({ games }: ClosedGamesTableProps) {
  const [pageSize, setPageSize] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter games based on search term
  const filteredGames = games.filter(game => 
    game.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredGames.length / Number(pageSize));
  const startIndex = (currentPage - 1) * Number(pageSize);
  const endIndex = startIndex + Number(pageSize);
  const currentGames = filteredGames.slice(startIndex, endIndex);

  // Generate page numbers array
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm">Registros por página:</span>
          <Select value={pageSize} onValueChange={setPageSize}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Localizar Registro:</span>
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Criação</TableHead>
            <TableHead>Fechamento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentGames.map((game) => (
            <TableRow key={game.id}>
              <TableCell>{game.name || "Sem nome"}</TableCell>
              <TableCell>
                {format(new Date(game.created_at), "dd/MM/yyyy - HH:mm")}
                <br />
                <span className="text-sm text-muted-foreground">CAIXA</span>
              </TableCell>
              <TableCell>
                {game.closed_at && (
                  <>
                    {format(new Date(game.closed_at), "dd/MM/yyyy - HH:mm")}
                    <br />
                    <span className="text-sm text-muted-foreground">CAIXA</span>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages}
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            Primeira
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(curr => curr - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          {pageNumbers.map(number => (
            <Button
              key={number}
              variant={currentPage === number ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(curr => curr + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Última
          </Button>
        </div>
      </div>
    </div>
  );
}