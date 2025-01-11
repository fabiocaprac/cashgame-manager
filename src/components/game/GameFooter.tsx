import { useState } from "react";
import { CashGameSummary } from "@/components/CashGameSummary";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BanknoteIcon, CreditCard, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/types";

interface GameFooterProps {
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

export function GameFooter({
  chipsInPlay,
  pendingDebits,
  pendingCredits,
  finalBalance,
  movements,
}: GameFooterProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const methodIcons = {
    cash: BanknoteIcon,
    card: CreditCard,
    pix: QrCode,
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t transition-all duration-300",
      isExpanded ? "pb-6" : "h-16"
    )}>
      <div className="container mx-auto p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto mb-4"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        
        {!isExpanded ? (
          <div className="flex justify-between items-center">
            <div className="flex gap-8">
              {movements.map((movement) => {
                const Icon = methodIcons[movement.method];
                return (
                  <div key={movement.method} className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    <span className={cn(
                      "font-medium",
                      movement.balance >= 0 ? "text-green-500" : "text-destructive"
                    )}>
                      {movement.balance >= 0 ? "+" : "-"}R$ {Math.abs(movement.balance).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <CashGameSummary
              chipsInPlay={chipsInPlay}
              pendingDebits={pendingDebits}
              pendingCredits={pendingCredits}
              finalBalance={finalBalance}
              movements={movements}
            />
          </div>
        )}
      </div>
    </div>
  );
}