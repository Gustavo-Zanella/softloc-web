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
import { Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const schema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  discount: z.coerce.number().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().positive(),
    unitPrice: z.coerce.number().positive(),
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
  const [availabilityStatus, setAvailabilityStatus] = useState<Record<string, boolean>>({});

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

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { items: [{ productId: '', quantity: 1, unitPrice: 0 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const items = watch('items');

  const total = items.reduce((acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0), 0);
  const discount = watch('discount') ?? 0;

  async function checkAvailability(index: number) {
    const item = items[index];
    if (!item.productId || !startDate || !endDate || startDate >= endDate) return;
    try {
      const result = await api.products.list({ limit: 1 });
      const avail = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/storefront/products/${item.productId}/availability?startDate=${startDate}&endDate=${endDate}&quantity=${item.quantity}`
      ).then((r) => r.json());
      setAvailabilityStatus((prev) => ({ ...prev, [index]: avail.available }));
    } catch {
      toast.error('Erro ao verificar disponibilidade.');
    }
  }

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.contracts.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrato criado.');
      reset();
      setAvailabilityStatus({});
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
            <Select onValueChange={(v) => setValue('customerId', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o cliente..." /></SelectTrigger>
              <SelectContent>
                {customers?.data.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} — {c.cpfCnpj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && <p className="text-destructive text-xs mt-1">{errors.customerId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Retirada *</Label>
              <Input type="date" {...register('startDate')} />
            </div>
            <div>
              <Label>Data de Devolução *</Label>
              <Input type="date" {...register('endDate')} min={startDate} />
            </div>
          </div>

          {/* Itens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Itens *</Label>
              <Button type="button" size="sm" variant="outline"
                onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}>
                <Plus className="h-3 w-3" /> Adicionar Item
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, i) => {
                const selectedProduct = products?.data.find((p) => p.id === items[i]?.productId);
                return (
                  <div key={field.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          onValueChange={(v) => {
                            setValue(`items.${i}.productId`, v);
                            const prod = products?.data.find((p) => p.id === v);
                            if (prod) setValue(`items.${i}.unitPrice`, prod.priceDiaria);
                            setAvailabilityStatus((prev) => { const n = { ...prev }; delete n[i]; return n; });
                          }}
                        >
                          <SelectTrigger><SelectValue placeholder="Produto..." /></SelectTrigger>
                          <SelectContent>
                            {products?.data.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input type="number" min="1" className="w-20" placeholder="Qtd"
                        {...register(`items.${i}.quantity`)}
                        onChange={(e) => {
                          setValue(`items.${i}.quantity`, Number(e.target.value));
                          setAvailabilityStatus((prev) => { const n = { ...prev }; delete n[i]; return n; });
                        }}
                      />
                      <Input type="number" step="0.01" className="w-28" placeholder="Preço"
                        {...register(`items.${i}.unitPrice`)} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => checkAvailability(i)}
                        title="Verificar disponibilidade"
                      >
                        {availabilityStatus[i] === undefined ? '?' :
                          availabilityStatus[i] ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                            <AlertCircle className="h-4 w-4 text-destructive" />}
                      </Button>
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive"
                          onClick={() => remove(i)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {availabilityStatus[i] === false && (
                      <p className="text-destructive text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Produto indisponível nas datas selecionadas.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.items && <p className="text-destructive text-xs mt-1">Adicione pelo menos um item.</p>}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Desconto (R$)</Label>
              <Input type="number" step="0.01" min="0" {...register('discount')} />
            </div>
            <div className="text-right pt-5">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{formatCurrency(Math.max(0, total - discount))}</p>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <textarea
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('notes')}
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
