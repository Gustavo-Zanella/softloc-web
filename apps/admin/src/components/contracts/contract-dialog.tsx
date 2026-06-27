'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/use-api';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@softloc/ui';
import { formatCurrency } from '@softloc/ui';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const schema = z.object({
  customer_id: z.string().min(1, 'Selecione um cliente'),
  address_id: z.string().min(1, 'Selecione um endereço'),
  data_evento: z.string().min(1),
  data_retirada_prevista: z.string().min(1),
  data_devolucao_prevista: z.string().min(1),
  valor_desconto: z.coerce.number().optional(),
  observacoes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().min(1),
    quantidade: z.coerce.number().int().positive(),
  })).min(1, 'Adicione ao menos um item'),
});

type FormData = z.infer<typeof schema>;

interface ContractDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ContractDialog({ open, onClose }: ContractDialogProps) {
  const api = useApi();
  const qc = useQueryClient();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => api.customers.list({ limit: 200 }),
    enabled: open,
  });

  const { data: products } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => api.products.list({ limit: 200 }),
    enabled: open,
  });

  const selectedCustomer = customers?.data.find((c) => c.id === selectedCustomerId);

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { items: [{ product_id: '', quantidade: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const items = watch('items');
  const valorDesconto = watch('valor_desconto') ?? 0;

  const total = items.reduce((acc, item) => {
    const prod = products?.data.find((p) => p.id === item.product_id);
    return acc + (item.quantidade || 0) * (prod?.preco_locacao_diaria || 0);
  }, 0);

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.contracts.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrato criado.');
      reset();
      setSelectedCustomerId('');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Contrato / Orçamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
          <div>
            <Label>Cliente *</Label>
            <Select onValueChange={(v) => { setValue('customer_id', v); setSelectedCustomerId(v); setValue('address_id', ''); }}>
              <SelectTrigger><SelectValue placeholder="Selecione o cliente..." /></SelectTrigger>
              <SelectContent>
                {customers?.data.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customer_id && <p className="text-destructive text-xs mt-1">{errors.customer_id.message}</p>}
          </div>

          {selectedCustomer && selectedCustomer.addresses.length > 0 && (
            <div>
              <Label>Endereço do Evento *</Label>
              <Select onValueChange={(v) => setValue('address_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o endereço..." /></SelectTrigger>
                <SelectContent>
                  {selectedCustomer.addresses.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.logradouro}, {a.numero} — {a.bairro}, {a.cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.address_id && <p className="text-destructive text-xs mt-1">{errors.address_id.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Data do Evento *</Label>
              <Input type="date" {...register('data_evento')} />
            </div>
            <div>
              <Label>Retirada Prevista *</Label>
              <Input type="date" {...register('data_retirada_prevista')} />
            </div>
            <div>
              <Label>Devolução Prevista *</Label>
              <Input type="date" {...register('data_devolucao_prevista')} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Itens *</Label>
              <Button type="button" size="sm" variant="outline"
                onClick={() => append({ product_id: '', quantidade: 1 })}>
                <Plus className="h-3 w-3" /> Adicionar Item
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-end border rounded-lg p-3">
                  <div className="flex-1">
                    <Label className="text-xs">Produto</Label>
                    <Select onValueChange={(v) => setValue(`items.${i}.product_id`, v)}>
                      <SelectTrigger><SelectValue placeholder="Produto..." /></SelectTrigger>
                      <SelectContent>
                        {products?.data.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome} — {formatCurrency(p.preco_locacao_diaria)}/dia
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Quantidade</Label>
                    <Input type="number" min="1" {...register(`items.${i}.quantidade`)} />
                  </div>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0"
                      onClick={() => remove(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.items && <p className="text-destructive text-xs mt-1">Adicione pelo menos um item.</p>}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Desconto (R$)</Label>
              <Input type="number" step="0.01" min="0" {...register('valor_desconto')} />
            </div>
            <div className="text-right pt-5">
              <p className="text-sm text-muted-foreground">Total estimado</p>
              <p className="text-xl font-bold">{formatCurrency(Math.max(0, total - valorDesconto))}</p>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <textarea
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('observacoes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Contrato'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
