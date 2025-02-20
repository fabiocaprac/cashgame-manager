import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { EditAuthDialog } from "./EditAuthDialog";
import { useToast } from "./ui/use-toast";

const formSchema = z.object({
  player_id: z.string().min(1, "Selecione um jogador"),
  type: z.enum(["buy-in", "cash-out", "refund"] as const),
  chips: z.number().min(0),
  payment: z.number().min(0),
  method: z.enum(["cash", "card", "pix"] as const),
});

type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: { id: string; name: string }[];
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  isGameClosed?: boolean;
}

export function TransactionDialog({
  open,
  onOpenChange,
  players,
  onSubmit,
  isGameClosed = false,
}: TransactionDialogProps) {
  const { toast } = useToast();
  const [editAuthDialogOpen, setEditAuthDialogOpen] = useState(false);
  const [isEditAuthorized, setIsEditAuthorized] = useState(false);
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "buy-in",
      method: "cash",
      chips: 0,
      payment: 0,
    },
  });

  const handleSubmit = async (values: TransactionFormValues) => {
    if (isGameClosed && !isEditAuthorized) {
      setEditAuthDialogOpen(true);
      return;
    }

    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar transação",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isGameClosed && !isEditAuthorized
                ? "Caixa Fechado - Autorização Necessária"
                : "Registrar Transação"}
            </DialogTitle>
            <DialogDescription>
              {isGameClosed && !isEditAuthorized
                ? "Este caixa está fechado. Para fazer alterações, é necessário autorização."
                : "Registre uma nova transação para o jogador selecionado"}
            </DialogDescription>
          </DialogHeader>
          {isGameClosed && !isEditAuthorized ? (
            <Button onClick={() => setEditAuthDialogOpen(true)}>
              Solicitar Autorização
            </Button>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="player_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jogador</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um jogador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {players.map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="buy-in">Compra</SelectItem>
                          <SelectItem value="cash-out">Saída</SelectItem>
                          <SelectItem value="refund">Devolução</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor em Fichas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="R$"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Pagamento</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="R$"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pagamento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Dinheiro</SelectItem>
                          <SelectItem value="card">Cartão</SelectItem>
                          <SelectItem value="pix">Pix</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Confirmar
                </Button>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <EditAuthDialog
        open={editAuthDialogOpen}
        onOpenChange={setEditAuthDialogOpen}
        onConfirm={() => {
          setIsEditAuthorized(true);
          setEditAuthDialogOpen(false);
        }}
      />
    </>
  );
}