'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/use-api';
import { DataTable } from '@/components/ui/data-table';
import { Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@softloc/ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { User, UserRole } from '@softloc/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'ATENDENTE', 'FINANCEIRO']),
});
type FormData = z.infer<typeof schema>;

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  ATENDENTE: 'Atendente',
  FINANCEIRO: 'Financeiro',
};

export default function UsuariosPage() {
  const api = useApi();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'ATENDENTE' },
  });

  function openCreate() { setEditingId(null); reset({ role: 'ATENDENTE', name: '', email: '', password: '' }); setOpen(true); }
  function openEdit(user: User) {
    setEditingId(user.id);
    reset({ name: user.name, email: user.email, role: user.role, password: '' });
    setOpen(true);
  }

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const dto = { ...data, password: data.password || undefined };
      return editingId ? api.users.update(editingId, dto) : api.users.create(dto as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(editingId ? 'Usuário atualizado.' : 'Usuário criado.');
      setOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.users.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Usuário removido.'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Nome' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Papel',
      cell: ({ getValue }) => {
        const r = getValue<UserRole>();
        return <Badge variant={r === 'ADMIN' ? 'default' : r === 'FINANCEIRO' ? 'info' : 'secondary'}>{ROLE_LABELS[r]}</Badge>;
      },
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ getValue }) => <Badge variant={getValue<boolean>() ? 'success' : 'outline'}>{getValue<boolean>() ? 'Ativo' : 'Inativo'}</Badge>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
            onClick={() => { if (confirm('Remover usuário?')) deleteMutation.mutate(row.original.id); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Novo Usuário</Button>
      </div>

      <DataTable data={data} columns={columns} isLoading={isLoading} />

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input {...register('name')} />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label>{editingId ? 'Nova Senha (deixe vazio para não alterar)' : 'Senha *'}</Label>
              <Input type="password" {...register('password')} />
            </div>
            <div>
              <Label>Papel *</Label>
              <Select value={watch('role')} onValueChange={(v) => setValue('role', v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
