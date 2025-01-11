import { useState } from "react";
import { ChevronUp, ChevronDown, Wallet, BanknoteIcon, CreditCard, QrCode, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/types";

interface CollapsibleFooterPanelProps {
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

export function CollapsibleFooterPanel({
  chipsInPlay,
  pendingDebits,
  pendingCredits,
  finalBalance,
  movements,
}: CollapsibleFooterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const methodIcons: Record<PaymentMethod, React.ElementType> = {
    cash: BanknoteIcon,
    card: CreditCard,
    pix: QrCode,
    voucher: Receipt,
  };

  const getMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case "cash":
        return "Dinheiro";
      case "card":
        return "Cartão";
      case "pix":
        return "PIX";
      case "voucher":
        return "Vale";
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t">
      {!isExpanded && (
        <div className="container mx-auto p-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>R$ {Math.abs(chipsInPlay).toFixed(2)}</span>
          </div>
          {movements.map((movement) => {
            const Icon = methodIcons[movement.method];
            return (
              <div key={movement.method} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>R$ {movement.balance.toFixed(2)}</span>
              </div>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setIsExpanded(true)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isExpanded && (
        <div className="container mx-auto p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Resumo do Caixa</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Fichas em Jogo</span>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className={cn(
                "text-lg font-bold",
                chipsInPlay >= 0 ? "text-green-500" : "text-destructive"
              )}>
                R$ {Math.abs(chipsInPlay).toFixed(2)}
              </span>
            </div>

            {movements.map((movement) => {
              const Icon = methodIcons[movement.method];
              return (
                <div key={movement.method} className="glass-card p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      {getMethodLabel(movement.method)}
                    </span>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className={cn(
                    "text-lg font-bold",
                    movement.balance >= 0 ? "text-green-500" : "text-destructive"
                  )}>
                    R$ {movement.balance.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}