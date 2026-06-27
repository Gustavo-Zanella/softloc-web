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
  tipo_pessoa: z.enum(['FISICA', 'JURIDICA']),
  nome: z.string().min(2),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  email: z.string().email(),
  telefone: z.string().min(10),
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
    defaultValues: { tipo_pessoa: 'FISICA' },
  });

  useEffect(() => {
    if (customer) {
      reset({
        tipo_pessoa: customer.tipo_pessoa,
        nome: customer.nome,
        cpf: customer.cpf ?? '',
        cnpj: customer.cnpj ?? '',
        email: customer.email,
        telefone: customer.telefone,
      });
    } else if (!customerId) {
      reset({ tipo_pessoa: 'FISICA', nome: '', cpf: '', cnpj: '', email: '', telefone: '' });
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

  const tipoPessoa = watch('tipo_pessoa');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{customerId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <Label>Tipo</Label>
            <Select value={tipoPessoa} onValueChange={(v) => setValue('tipo_pessoa', v as 'FISICA' | 'JURIDICA')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FISICA">Pessoa Física</SelectItem>
                <SelectItem value="JURIDICA">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Nome / Razão Social *</Label>
            <Input {...register('nome')} placeholder="Nome completo" />
            {errors.nome && <p className="text-destructive text-xs mt-1">{errors.nome.message}</p>}
          </div>

          {tipoPessoa === 'FISICA' ? (
            <div>
              <Label>CPF</Label>
              <Input {...register('cpf')} placeholder="000.000.000-00" />
            </div>
          ) : (
            <div>
              <Label>CNPJ</Label>
              <Input {...register('cnpj')} placeholder="00.000.000/0000-00" />
            </div>
          )}

          <div>
            <Label>Email *</Label>
            <Input {...register('email')} type="email" placeholder="email@exemplo.com" />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label>Telefone / WhatsApp *</Label>
            <Input {...register('telefone')} placeholder="(11) 99999-9999" />
            {errors.telefone && <p className="text-destructive text-xs mt-1">{errors.telefone.message}</p>}
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
