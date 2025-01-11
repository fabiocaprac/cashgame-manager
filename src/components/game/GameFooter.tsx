import { useState } from "react";
import { CashGameSummary } from "@/components/CashGameSummary";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
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

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t transition-all duration-300",
      isExpanded ? "h-[300px]" : "h-16"
    )}>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {!isExpanded ? (
          <div className="flex justify-between items-center">
            <div className="flex gap-8">
              <div>
                <span className="text-sm text-muted-foreground">Fichas:</span>
                <span className="ml-2 font-medium">
                  R$ {chipsInPlay.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Débitos:</span>
                <span className="ml-2 font-medium text-destructive">
                  -R$ {pendingDebits.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Créditos:</span>
                <span className="ml-2 font-medium text-green-500">
                  R$ {pendingCredits.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Saldo:</span>
                <span className={cn(
                  "ml-2 font-medium",
                  finalBalance >= 0 ? "text-green-500" : "text-destructive"
                )}>
                  R$ {Math.abs(finalBalance).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[220px]">
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