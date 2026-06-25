'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@softloc/ui';
import { formatCurrency } from '@softloc/ui';
import { TrendingUp, FileText, AlertTriangle, Star } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  ORCAMENTO: '#94a3b8',
  CONFIRMADO: '#60a5fa',
  EM_ANDAMENTO: '#34d399',
  DEVOLVIDO: '#a78bfa',
  FINALIZADO: '#f59e0b',
  CANCELADO: '#f87171',
};

export default function DashboardPage() {
  const api = useApi();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.dashboard.getMetrics(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-lg skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Contratos este mês"
          value={String(data?.contractsThisMonth ?? 0)}
          icon={<FileText className="h-5 w-5 text-blue-500" />}
          bg="bg-blue-50"
        />
        <MetricCard
          title="Faturamento este mês"
          value={formatCurrency(data?.revenueThisMonth ?? 0)}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          bg="bg-green-50"
        />
        <MetricCard
          title="Devoluções atrasadas"
          value={String(data?.overdueReturns ?? 0)}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          bg="bg-red-50"
        />
        <MetricCard
          title="Produtos mais alugados"
          value={data?.topProducts?.[0]?.productName ?? '—'}
          icon={<Star className="h-5 w-5 text-amber-500" />}
          bg="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receita por mês */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Receita por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data?.revenueByMonth ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#D4A017" radius={[4, 4, 0, 0]} name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contratos por status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contratos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data?.contractsByStatus ?? []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {(data?.contractsByStatus ?? []).map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#ccc'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top produtos */}
      {data?.topProducts && data.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produtos Mais Alugados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-5">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{p.productName}</span>
                      <span className="text-sm text-muted-foreground">{p.count}x</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-gold rounded-full"
                        style={{ width: `${Math.min(100, (p.count / (data.topProducts[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, bg }: { title: string; value: string; icon: React.ReactNode; bg: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-xl font-bold truncate max-w-[160px]">{value}</p>
          </div>
          <div className={`p-2.5 rounded-lg ${bg}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
