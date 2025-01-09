import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

interface CloseGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function CloseGameDialog({
  open,
  onOpenChange,
  onConfirm,
}: CloseGameDialogProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (password !== "452631") {
      toast({
        title: "Senha incorreta",
        description: "A senha mestra informada está incorreta.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm();
      setPassword("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao fechar o caixa",
        description: "Ocorreu um erro ao tentar fechar o caixa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar fechamento do caixa</DialogTitle>
          <DialogDescription>
            Digite a senha mestra para confirmar o fechamento do caixa.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="password"
          placeholder="Senha mestra"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Fechando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}