'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/use-api';
import { DataTable } from '@/components/ui/data-table';
import { Button, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@softloc/ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { Product } from '@softloc/types';
import { formatCurrency } from '@softloc/ui';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ProductDialog } from '@/components/products/product-dialog';
import Link from 'next/link';

export default function ProdutosPage() {
  const api = useApi();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, categoryId],
    queryFn: () => api.products.list({ page, limit: 20, categoryId: categoryId || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.products.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Produto removido.'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const columns: ColumnDef<Product>[] = [
    {
      id: 'image',
      header: '',
      cell: ({ row }) => {
        const img = row.original.images?.[0];
        return img ? (
          <img src={img.url} alt="" className="h-10 w-10 rounded object-cover" />
        ) : (
          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-gray-400" />
          </div>
        );
      },
    },
    { accessorKey: 'nome', header: 'Nome' },
    {
      id: 'categoria',
      header: 'Categoria',
      cell: ({ row }) => row.original.category?.nome ?? '—',
    },
    {
      accessorKey: 'preco_locacao_diaria',
      header: 'Diária',
      cell: ({ getValue }) => formatCurrency(Number(getValue<number>())),
    },
    { accessorKey: 'quantidade_total', header: 'Qtd.' },
    {
      accessorKey: 'exibir_na_vitrine',
      header: 'Vitrine',
      cell: ({ getValue }) => (
        <Badge variant={getValue<boolean>() ? 'success' : 'outline'}>
          {getValue<boolean>() ? 'Sim' : 'Não'}
        </Badge>
      ),
    },
    {
      accessorKey: 'destaque',
      header: 'Destaque',
      cell: ({ getValue }) => (
        <Badge variant={getValue<boolean>() ? 'warning' : 'outline'}>
          {getValue<boolean>() ? 'Sim' : 'Não'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => { setEditingId(row.original.id); setDialogOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="icon" className="text-destructive hover:text-destructive"
            onClick={() => { if (confirm('Remover produto?')) deleteMutation.mutate(row.original.id); }}
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
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-muted-foreground text-sm">{data?.total ?? 0} produto{data?.total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/categorias">Categorias</Link>
          </Button>
          <Button onClick={() => { setEditingId(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> Novo Produto
          </Button>
        </div>
      </div>

      <Select value={categoryId} onValueChange={(v) => { setCategoryId(v === 'all' ? '' : v); setPage(1); }}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Filtrar por categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categoriesData?.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DataTable data={data?.data ?? []} columns={columns} isLoading={isLoading} />

      <ProductDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingId(null); }}
        productId={editingId}
        categories={categoriesData ?? []}
      />
    </div>
  );
}
