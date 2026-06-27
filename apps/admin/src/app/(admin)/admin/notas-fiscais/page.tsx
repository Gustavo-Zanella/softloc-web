'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/use-api';
import { DataTable } from '@/components/ui/data-table';
import { Button, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@softloc/ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { Invoice, InvoiceStatus } from '@softloc/types';
import { formatDate } from '@softloc/ui';
import { Download, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_VARIANT: Record<InvoiceStatus, string> = {
  PENDENTE: 'secondary',
  AUTORIZADA: 'success',
  ERRO: 'destructive',
  CANCELADA: 'outline',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDENTE: 'Pendente', AUTORIZADA: 'Autorizada', ERRO: 'Erro', CANCELADA: 'Cancelada',
};

export default function NotasFiscaisPage() {
  const api = useApi();
  const qc = useQueryClient();
  const [status, setStatus] = useState('');

  const { data: allInvoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list(),
  });

  const data = allInvoices
    ? status ? allInvoices.filter((i) => i.status === status) : allInvoices
    : [];

  const cancelMutation = useMutation({
    mutationFn: ({ id, justificativa }: { id: string; justificativa: string }) =>
      api.invoices.cancel(id, justificativa),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Nota cancelada.'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: 'number', header: 'Número', cell: ({ getValue }) => getValue<string>() ?? '—' },
    { accessorKey: 'series', header: 'Série', cell: ({ getValue }) => getValue<string>() ?? '—' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<InvoiceStatus>();
        return <Badge variant={STATUS_VARIANT[s] as any}>{STATUS_LABELS[s]}</Badge>;
      },
    },
    {
      accessorKey: 'issuedAt',
      header: 'Emitida em',
      cell: ({ getValue }) => getValue<string>() ? formatDate(getValue<string>()) : '—',
    },
    {
      accessorKey: 'errorMessage',
      header: 'Erro',
      cell: ({ getValue }) => getValue<string>() ? (
        <div className="flex items-center gap-1 text-destructive text-xs max-w-[200px] truncate">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {getValue<string>()}
        </div>
      ) : null,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
            {row.original.pdfUrl && (
            <Button variant="ghost" size="icon" asChild>
              <a href={row.original.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
          {row.original.status === 'AUTORIZADA' && (
            <Button
              variant="ghost" size="icon" className="text-destructive"
              onClick={() => {
                const justificativa = prompt('Motivo do cancelamento:');
                if (justificativa) cancelMutation.mutate({ id: row.original.id, justificativa });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notas Fiscais</h1>
          <p className="text-muted-foreground text-sm">{data.length ?? 0} nota{data.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); }}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DataTable data={data} columns={columns} isLoading={isLoading} />
    </div>
  );
}
