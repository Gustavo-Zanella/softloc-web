'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/use-api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@softloc/ui';
import { toast } from 'sonner';

const schema = z.object({
  type: z.enum(['PF', 'PJ']),
  name: z.string().min(2),
  cpfCnpj: z.string().min(11),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10),
});

type FormData = z.infer<typeof schema>;

interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  customerId?: string | null;
}

export function CustomerDialog({ open, onClose, customerId }: CustomerDialogProps) {
  const api = useApi();
  const qc = useQueryClient();

  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => api.customers.get(customerId!),
    enabled: !!customerId && open,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'PF' },
  });

  useEffect(() => {
    if (customer) {
      reset({
        type: customer.type,
        name: customer.name,
        cpfCnpj: customer.cpfCnpj,
        email: customer.email ?? '',
        phone: customer.phone,
      });
    } else if (!customerId) {
      reset({ type: 'PF', name: '', cpfCnpj: '', email: '', phone: '' });
    }
  }, [customer, customerId, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      customerId
        ? api.customers.update(customerId, data)
        : api.customers.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      toast.success(customerId ? 'Cliente atualizado.' : 'Cliente criado.');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const type = watch('type');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{customerId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setValue('type', v as 'PF' | 'PJ')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PF">Pessoa Física</SelectItem>
                <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Nome / Razão Social *</Label>
            <Input {...register('name')} placeholder="Nome completo" />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label>{type === 'PF' ? 'CPF *' : 'CNPJ *'}</Label>
            <Input {...register('cpfCnpj')} placeholder={type === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'} />
            {errors.cpfCnpj && <p className="text-destructive text-xs mt-1">{errors.cpfCnpj.message}</p>}
          </div>

          <div>
            <Label>Email</Label>
            <Input {...register('email')} type="email" placeholder="email@exemplo.com" />
          </div>

          <div>
            <Label>Telefone / WhatsApp *</Label>
            <Input {...register('phone')} placeholder="(11) 99999-9999" />
            {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
