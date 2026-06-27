'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/use-api';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@softloc/ui';
import { formatCurrency, formatDate } from '@softloc/ui';
import type { ContractStatus } from '@softloc/types';
import { ChevronLeft, CheckCircle, Play, RotateCcw, X, Receipt } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ReturnDialog } from '@/components/contracts/return-dialog';

const STATUS_LABELS: Record<ContractStatus, string> = {
  ORCAMENTO: 'Orçamento', CONFIRMADO: 'Confirmado', EM_ANDAMENTO: 'Em Andamento',
  DEVOLVIDO: 'Devolvido', FINALIZADO: 'Finalizado', CANCELADO: 'Cancelado',
};

const STATUS_COLORS: Record<ContractStatus, string> = {
  ORCAMENTO: 'bg-gray-100 text-gray-700',
  CONFIRMADO: 'bg-blue-100 text-blue-700',
  EM_ANDAMENTO: 'bg-green-100 text-green-700',
  DEVOLVIDO: 'bg-purple-100 text-purple-700',
  FINALIZADO: 'bg-amber-100 text-amber-700',
  CANCELADO: 'bg-red-100 text-red-700',
};

export default function ContratoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const api = useApi();
  const qc = useQueryClient();
  const [returnOpen, setReturnOpen] = useState(false);

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => api.contracts.get(id),
  });

  function useAction(fn: () => Promise<unknown>, successMsg: string) {
    return useMutation({
      mutationFn: fn,
      onSuccess: () => { qc.invalidateQueries({ queryKey: ['contract', id] }); toast.success(successMsg); },
      onError: (err: Error) => toast.error(err.message),
    });
  }

  const confirmMutation = useAction(() => api.contracts.updateStatus(id, 'CONFIRMADO'), 'Contrato confirmado.');
  const startMutation = useAction(() => api.contracts.updateStatus(id, 'EM_ANDAMENTO'), 'Contrato iniciado.');
  const cancelMutation = useAction(() => api.contracts.updateStatus(id, 'CANCELADO'), 'Contrato cancelado.');

  const emitInvoiceMutation = useMutation({
    mutationFn: () => api.invoices.emit(id),
    onSuccess: () => { toast.success('Nota fiscal emitida.'); },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <div className="h-96 rounded-lg skeleton" />;
  if (!contract) return <p>Contrato não encontrado.</p>;

  const status = contract.status as ContractStatus;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/contratos" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Contrato #{contract.numero_contrato}</h1>
          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-2">
        {status === 'ORCAMENTO' && (
          <Button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}>
            <CheckCircle className="h-4 w-4" /> Confirmar
          </Button>
        )}
        {status === 'CONFIRMADO' && (
          <Button onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
            <Play className="h-4 w-4" /> Iniciar
          </Button>
        )}
        {status === 'EM_ANDAMENTO' && (
          <Button onClick={() => setReturnOpen(true)}>
            <RotateCcw className="h-4 w-4" /> Registrar Devolução
          </Button>
        )}
        {['DEVOLVIDO', 'FINALIZADO'].includes(status) && (
          <Button variant="outline" onClick={() => emitInvoiceMutation.mutate()} disabled={emitInvoiceMutation.isPending}>
            <Receipt className="h-4 w-4" /> Emitir Nota Fiscal
          </Button>
        )}
        {!['FINALIZADO', 'CANCELADO', 'DEVOLVIDO'].includes(status) && (
          <Button variant="outline" className="text-destructive hover:text-destructive border-destructive/50"
            onClick={() => { if (confirm('Cancelar este contrato?')) cancelMutation.mutate(); }}
            disabled={cancelMutation.isPending}>
            <X className="h-4 w-4" /> Cancelar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Cliente</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold">{contract.customer?.nome}</p>
            <p className="text-sm text-muted-foreground">{contract.customer?.telefone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Período</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm">Retirada: <span className="font-medium">{formatDate(contract.data_retirada_prevista)}</span></p>
            <p className="text-sm">Devolução: <span className="font-medium">{formatDate(contract.data_devolucao_prevista)}</span></p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Itens do Contrato</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left text-muted-foreground">
                <th className="pb-2 font-medium">Produto</th>
                <th className="pb-2 font-medium text-center">Qtd.</th>
                <th className="pb-2 font-medium text-right">Unit.</th>
                <th className="pb-2 font-medium text-right">Subtotal</th>
                {contract.status === 'DEVOLVIDO' || contract.status === 'FINALIZADO' ? (
                  <th className="pb-2 font-medium text-center">Condição</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {contract.items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-2">{item.product?.nome ?? item.product_id}</td>
                  <td className="py-2 text-center">{item.quantidade}</td>
                  <td className="py-2 text-right">{formatCurrency(Number(item.preco_unitario_aplicado))}</td>
                  <td className="py-2 text-right">{formatCurrency(Number(item.subtotal))}</td>
                  {contract.status === 'DEVOLVIDO' || contract.status === 'FINALIZADO' ? (
                    <td className="py-2 text-center">
                      <Badge variant={item.condicao_retorno === 'BOM' ? 'success' : item.condicao_retorno === 'DANIFICADO' ? 'warning' : 'destructive'}>
                        {item.condicao_retorno ?? '—'}
                      </Badge>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-3 text-right font-medium">Subtotal:</td>
                <td className="pt-3 text-right">{formatCurrency(Number(contract.valor_subtotal))}</td>
              </tr>
              {Number(contract.valor_desconto) > 0 && (
                <tr>
                  <td colSpan={3} className="text-right font-medium text-muted-foreground">Desconto:</td>
                  <td className="text-right text-muted-foreground">- {formatCurrency(Number(contract.valor_desconto))}</td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="pt-1 text-right font-bold">Total:</td>
                <td className="pt-1 text-right font-bold text-lg">{formatCurrency(Number(contract.valor_total))}</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {contract.observacoes && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Observações</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{contract.observacoes}</p></CardContent>
        </Card>
      )}

      <ReturnDialog
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        contractId={id}
        items={contract.items}
      />
    </div>
  );
}
