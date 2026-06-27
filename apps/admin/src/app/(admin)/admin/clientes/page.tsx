'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/use-api';
import { DataTable } from '@/components/ui/data-table';
import { Button, Input, Badge } from '@softloc/ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { Customer } from '@softloc/types';
import { formatCpfCnpj, formatPhone } from '@softloc/ui';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CustomerDialog } from '@/components/customers/customer-dialog';
import Link from 'next/link';

export default function ClientesPage() {
  const api = useApi();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => api.customers.list({ page, limit: 20, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.customers.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente removido.');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const columns: ColumnDef<Customer>[] = [
    { accessorKey: 'nome', header: 'Nome' },
    {
      id: 'cpfCnpj',
      header: 'CPF/CNPJ',
      cell: ({ row }) => formatCpfCnpj(row.original.cpf ?? row.original.cnpj),
    },
    {
      accessorKey: 'tipo_pessoa',
      header: 'Tipo',
      cell: ({ getValue }) => (
        <Badge variant={getValue<string>() === 'JURIDICA' ? 'info' : 'secondary'}>
          {getValue<string>() === 'JURIDICA' ? 'PJ' : 'PF'}
        </Badge>
      ),
    },
    {
      accessorKey: 'telefone',
      header: 'Telefone',
      cell: ({ getValue }) => formatPhone(getValue<string>()),
    },
    {
      accessorKey: 'ativo',
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={getValue<boolean>() ? 'success' : 'outline'}>
          {getValue<boolean>() ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/clientes/${row.original.id}`}>Ver</Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { setEditingId(row.original.id); setDialogOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm('Remover este cliente?')) deleteMutation.mutate(row.original.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm">{data?.total ?? 0} cliente{data?.total !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => { setEditingId(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CPF/CNPJ..."
          className="pl-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <DataTable data={data?.data ?? []} columns={columns} isLoading={isLoading} />

      {data && data.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 rounded text-sm border transition-colors ${p === page ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <CustomerDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingId(null); }}
        customerId={editingId}
      />
    </div>
  );
}
