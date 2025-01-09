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

interface EditAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function EditAuthDialog({
  open,
  onOpenChange,
  onConfirm,
}: EditAuthDialogProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (password !== "458697") {
      toast({
        title: "Senha incorreta",
        description: "A senha de edição informada está incorreta.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      onConfirm();
      setPassword("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao autorizar edição",
        description: "Ocorreu um erro ao tentar autorizar a edição.",
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
          <DialogTitle>Autorizar edição</DialogTitle>
          <DialogDescription>
            Digite a senha de edição para autorizar modificações neste caixa fechado.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="password"
          placeholder="Senha de edição"
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
            {isLoading ? "Autorizando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}