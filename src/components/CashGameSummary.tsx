import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/types";
import {
  BanknoteIcon,
  CreditCard,
  QrCode,
  Wallet,
} from "lucide-react";

interface CashGameSummaryProps {
  chipsInPlay: number;
  pendingDebits: number;
  pendingCredits: number;
  finalBalance: number;
  movements: {
    method: PaymentMethod;
    received: number;
    paid: number;
    balance: number;
  }[];
}

export function CashGameSummary({
  chipsInPlay,
  pendingDebits,
  pendingCredits,
}: CashGameSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fichas em Jogo</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {chipsInPlay.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Débitos Pendentes</CardTitle>
          <div className="h-4 w-4 text-destructive">-</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            -R$ {pendingDebits.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Créditos Pendentes
          </CardTitle>
          <div className="h-4 w-4 text-green-500">+</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">
            R$ {pendingCredits.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}