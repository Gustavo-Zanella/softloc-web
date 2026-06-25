'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import { Button, Input, Label } from '@softloc/ui';
import { storefrontApi } from '@/lib/api';

interface AvailabilityCheckerProps {
  productId: string;
  productName: string;
  whatsapp?: string;
}

export function AvailabilityChecker({ productId, productName, whatsapp }: AvailabilityCheckerProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [check, setCheck] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['availability', productId, startDate, endDate, quantity],
    queryFn: () => storefrontApi.getProductAvailability(productId, startDate, endDate, quantity),
    enabled: check && !!startDate && !!endDate && startDate < endDate,
  });

  const waMessage = whatsapp && startDate && endDate
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        `Olá! Tenho interesse no produto: *${productName}*\nData de retirada: ${startDate}\nData de devolução: ${endDate}\nQuantidade: ${quantity}`
      )}`
    : null;

  return (
    <div className="space-y-4 border rounded-xl p-5 bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Verificar Disponibilidade</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="start">Retirada</Label>
          <Input
            id="start"
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setCheck(false); }}
          />
        </div>
        <div>
          <Label htmlFor="end">Devolução</Label>
          <Input
            id="end"
            type="date"
            min={startDate || today}
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setCheck(false); }}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="qty">Quantidade</Label>
        <Input
          id="qty"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => { setQuantity(Number(e.target.value)); setCheck(false); }}
          className="w-24"
        />
      </div>

      <Button
        onClick={() => setCheck(true)}
        disabled={!startDate || !endDate || startDate >= endDate || isLoading}
        className="w-full"
      >
        {isLoading ? 'Verificando...' : 'Verificar Disponibilidade'}
      </Button>

      {data && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${data.available ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {data.available ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              Disponível! ({data.availableQuantity} unidade{data.availableQuantity !== 1 ? 's' : ''} disponíve{data.availableQuantity !== 1 ? 'is' : 'l'})
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              Indisponível nas datas selecionadas.
            </>
          )}
        </div>
      )}

      {waMessage && (
        <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white" size="lg">
          <a href={waMessage} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5" />
            Solicitar via WhatsApp
          </a>
        </Button>
      )}
    </div>
  );
}
