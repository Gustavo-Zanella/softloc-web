'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/use-api';
import { DataTable } from '@/components/ui/data-table';
import { Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Badge } from '@softloc/ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { Category } from '@softloc/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CategoriasPage() {
  const api = useApi();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  function openCreate() { setEditing(null); reset({ nome: '', descricao: '' }); setOpen(true); }
  function openEdit(cat: Category) { setEditing(cat); reset({ nome: cat.nome, descricao: cat.descricao ?? '' }); setOpen(true); }

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      editing ? api.categories.update(editing.id, data) : api.categories.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success(editing ? 'Categoria atualizada.' : 'Categoria criada.');
      setOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.categories.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Categoria removida.'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const columns: ColumnDef<Category>[] = [
    { accessorKey: 'nome', header: 'Nome' },
    { accessorKey: 'slug', header: 'Slug' },
    { accessorKey: 'descricao', header: 'Descrição' },
    {
      accessorKey: 'ativo',
      header: 'Status',
      cell: ({ getValue }) => <Badge variant={getValue<boolean>() ? 'success' : 'outline'}>{getValue<boolean>() ? 'Ativa' : 'Inativa'}</Badge>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
            onClick={() => { if (confirm('Remover?')) deleteMutation.mutate(row.original.id); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Nova Categoria</Button>
      </div>

      <DataTable data={data} columns={columns} isLoading={isLoading} />

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input {...register('nome')} />
              {errors.nome && <p className="text-destructive text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <Label>Descrição</Label>
              <Input {...register('descricao')} />
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
