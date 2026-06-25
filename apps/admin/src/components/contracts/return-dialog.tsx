'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/use-api';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@softloc/ui';
import type { ContractItem } from '@softloc/types';
import { toast } from 'sonner';

const schema = z.object({
  items: z.array(z.object({
    contractItemId: z.string(),
    condition: z.enum(['OK', 'AVARIADO', 'PERDIDO']),
    damageFee: z.coerce.number().optional(),
    notes: z.string().optional(),
  })),
});

type FormData = z.infer<typeof schema>;

interface ReturnDialogProps {
  open: boolean;
  onClose: () => void;
  contractId: string;
  items: ContractItem[];
}

export function ReturnDialog({ open, onClose, contractId, items }: ReturnDialogProps) {
  const api = useApi();
  const qc = useQueryClient();

  const { register, handleSubmit, control, watch, setValue, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      items: items.map((i) => ({ contractItemId: i.id, condition: 'OK', damageFee: 0, notes: '' })),
    },
  });

  const { fields } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.contracts.registerReturn(contractId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract', contractId] });
      toast.success('Devolução registrada.');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Devolução</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          {fields.map((field, i) => {
            const item = items[i];
            const condition = watchedItems[i]?.condition;
            return (
              <div key={field.id} className="border rounded-lg p-3 space-y-2">
                <p className="font-medium text-sm">{item.product?.name ?? `Item ${i + 1}`} — {item.quantity} un.</p>
                <div>
                  <Label>Condição</Label>
                  <Select
                    value={condition}
                    onValueChange={(v) => setValue(`items.${i}.condition`, v as 'OK' | 'AVARIADO' | 'PERDIDO')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="AVARIADO">Avariado</SelectItem>
                      <SelectItem value="PERDIDO">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {condition !== 'OK' && (
                  <>
                    <div>
                      <Label>Multa (R$)</Label>
                      <Input type="number" step="0.01" min="0" {...register(`items.${i}.damageFee`)} />
                    </div>
                    <div>
                      <Label>Observação</Label>
                      <Input {...register(`items.${i}.notes`)} placeholder="Descreva o problema..." />
                    </div>
                  </>
                )}
              </div>
            );
          })}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Confirmar Devolução'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
