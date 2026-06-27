'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/use-api';
import { DataTable } from '@/components/ui/data-table';
import { Button, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input } from '@softloc/ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { RentalContract, ContractStatus } from '@softloc/types';
import { formatCurrency, formatDate } from '@softloc/ui';
import { Plus, Eye, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ContractDialog } from '@/components/contracts/contract-dialog';

const STATUS_LABELS: Record<ContractStatus, string> = {
  ORCAMENTO: 'Orçamento',
  CONFIRMADO: 'Confirmado',
  EM_ANDAMENTO: 'Em Andamento',
  DEVOLVIDO: 'Devolvido',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};

const STATUS_BADGE: Record<ContractStatus, 'secondary' | 'info' | 'success' | 'warning' | 'default' | 'destructive' | 'outline'> = {
  ORCAMENTO: 'secondary',
  CONFIRMADO: 'info',
  EM_ANDAMENTO: 'success',
  DEVOLVIDO: 'warning',
  FINALIZADO: 'default',
  CANCELADO: 'destructive',
};

export default function ContratosPage() {
  const api = useApi();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['contracts', page, status],
    queryFn: () => api.contracts.list({ page, limit: 20, status: status || undefined }),
  });

  async function downloadPdf(id: string, number: string) {
    try {
      const res = await api.contracts.getPdf(id);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erro ao baixar PDF.');
    }
  }

  const columns: ColumnDef<RentalContract>[] = [
    { accessorKey: 'numero_contrato', header: 'Nº Contrato' },
    {
      id: 'cliente',
      header: 'Cliente',
      cell: ({ row }) => row.original.customer?.nome ?? '—',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<ContractStatus>();
        return <Badge variant={STATUS_BADGE[s] ?? 'outline'}>{STATUS_LABELS[s]}</Badge>;
      },
    },
    {
      accessorKey: 'data_retirada_prevista',
      header: 'Retirada',
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      accessorKey: 'data_devolucao_prevista',
      header: 'Devolução',
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      accessorKey: 'valor_total',
      header: 'Total',
      cell: ({ getValue }) => formatCurrency(Number(getValue<number>())),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/admin/contratos/${row.original.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => downloadPdf(row.original.id, row.original.numero_contrato)}
          >
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contratos</h1>
          <p className="text-muted-foreground text-sm">{data?.total ?? 0} contrato{data?.total !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Novo Contrato
        </Button>
      </div>

      <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DataTable data={data?.data ?? []} columns={columns} isLoading={isLoading} />

      <ContractDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
