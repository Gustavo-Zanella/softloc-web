'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Label } from '@softloc/ui';
import { storefrontApi } from '@/lib/api';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  phone: z.string().min(10, 'Telefone inválido'),
  message: z.string().min(10, 'Mensagem muito curta'),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    await storefrontApi.submitContact(data);
    setSuccess(true);
    reset();
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h3 className="text-xl font-semibold">Mensagem enviada!</h3>
        <p className="text-muted-foreground">Entraremos em contato em breve.</p>
        <Button variant="outline" onClick={() => setSuccess(false)}>Enviar outra mensagem</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" placeholder="Seu nome completo" {...register('name')} />
        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="phone">Telefone *</Label>
        <Input id="phone" placeholder="(11) 99999-9999" {...register('phone')} />
        {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <Label htmlFor="message">Mensagem *</Label>
        <textarea
          id="message"
          rows={5}
          placeholder="Conte-nos sobre o seu evento..."
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          {...register('message')}
        />
        {errors.message && <p className="text-destructive text-sm mt-1">{errors.message.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
      </Button>
    </form>
  );
}
