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
  data_devolucao_real: z.string().min(1),
  items: z.array(z.object({
    item_id: z.string(),
    condicao_retorno: z.enum(['BOM', 'DANIFICADO', 'PERDIDO']),
    avaria: z.boolean().optional(),
    descricao_avaria: z.string().optional(),
    valor_multa_avaria: z.coerce.number().optional(),
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
      data_devolucao_real: new Date().toISOString().split('T')[0],
      items: items.map((i) => ({ item_id: i.id, condicao_retorno: 'BOM' as const, avaria: false, descricao_avaria: '', valor_multa_avaria: 0 })),
    },
  });

  const { fields } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.contracts.registerDevolution(contractId, data),
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
          <div>
            <Label>Data de Devolução Real *</Label>
            <Input type="date" {...register('data_devolucao_real')} />
          </div>

          {fields.map((field, i) => {
            const item = items[i];
            const condicao = watchedItems[i]?.condicao_retorno;
            return (
              <div key={field.id} className="border rounded-lg p-3 space-y-2">
                <p className="font-medium text-sm">{item.product?.nome ?? `Item ${i + 1}`} — {item.quantidade} un.</p>
                <div>
                  <Label>Condição</Label>
                  <Select
                    value={condicao}
                    onValueChange={(v) => setValue(`items.${i}.condicao_retorno`, v as 'BOM' | 'DANIFICADO' | 'PERDIDO')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOM">Bom</SelectItem>
                      <SelectItem value="DANIFICADO">Danificado</SelectItem>
                      <SelectItem value="PERDIDO">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {condicao !== 'BOM' && (
                  <>
                    <div>
                      <Label>Multa (R$)</Label>
                      <Input type="number" step="0.01" min="0" {...register(`items.${i}.valor_multa_avaria`)} />
                    </div>
                    <div>
                      <Label>Observação</Label>
                      <Input {...register(`items.${i}.descricao_avaria`)} placeholder="Descreva o problema..." />
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
