import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/types";
import {
  BanknoteIcon,
  CreditCard,
  QrCode,
  Receipt,
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
  finalBalance,
  movements,
}: CashGameSummaryProps) {
  const methodIcons: Record<PaymentMethod, React.ElementType> = {
    cash: BanknoteIcon,
    card: CreditCard,
    pix: QrCode,
    voucher: Receipt,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Final</CardTitle>
          <div
            className={cn(
              "h-4 w-4",
              finalBalance >= 0 ? "text-green-500" : "text-destructive"
            )}
          >
            {finalBalance >= 0 ? "+" : "-"}
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-2xl font-bold",
              finalBalance >= 0 ? "text-green-500" : "text-destructive"
            )}
          >
            R$ {Math.abs(finalBalance).toFixed(2)}
          </div>
        </CardContent>
      </Card>

      {movements.map((movement) => {
        const Icon = methodIcons[movement.method];
        return (
          <Card key={movement.method} className="glass-card col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Movimentação - {movement.method === "cash" ? "Dinheiro" : movement.method === "card" ? "Cartão" : movement.method === "pix" ? "PIX" : "Vale"}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Recebido:</span>
                  <span>R$ {movement.received.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pago:</span>
                  <span>R$ {movement.paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-sm text-muted-foreground">Saldo:</span>
                  <span
                    className={cn(
                      movement.balance >= 0 ? "text-green-500" : "text-destructive"
                    )}
                  >
                    R$ {Math.abs(movement.balance).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}