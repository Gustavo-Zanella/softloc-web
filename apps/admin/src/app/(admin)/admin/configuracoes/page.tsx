'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@softloc/ui';
import { toast } from 'sonner';
import { Globe, Palette, MapPin, MessageCircle, Image as ImageIcon } from 'lucide-react';

const schema = z.object({
  nomefantasia: z.string().min(1),
  logoUrl: z.string().optional(),
  corPrimaria: z.string(),
  corSecundaria: z.string(),
  bannerTitulo: z.string(),
  bannerSubtitulo: z.string(),
  bannerImagemUrl: z.string().optional(),
  textoSobre: z.string(),
  whatsappNumero: z.string(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  enderecoExibicao: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ConfiguracoesPage() {
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      corPrimaria: '#D4A017',
      corSecundaria: '#9A7312',
    },
  });

  function onSubmit(_data: FormData) {
    toast.info('Endpoint de configurações ainda não implementado no backend.');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configurações do Site</h1>
        <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty || isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Identidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" /> Identidade
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome Fantasia *</Label>
              <Input {...register('nomefantasia')} />
              {errors.nomefantasia && <p className="text-destructive text-xs mt-1">{errors.nomefantasia.message}</p>}
            </div>
            <div>
              <Label>URL do Logo</Label>
              <Input {...register('logoUrl')} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        {/* Cores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" /> Cores
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cor Primária</Label>
              <div className="flex gap-2">
                <input type="color" {...register('corPrimaria')} className="h-10 w-14 rounded border cursor-pointer" />
                <Input {...register('corPrimaria')} className="flex-1" />
              </div>
            </div>
            <div>
              <Label>Cor Secundária</Label>
              <div className="flex gap-2">
                <input type="color" {...register('corSecundaria')} className="h-10 w-14 rounded border cursor-pointer" />
                <Input {...register('corSecundaria')} className="flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banner */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Banner Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input {...register('bannerTitulo')} />
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Input {...register('bannerSubtitulo')} />
            </div>
            <div>
              <Label>URL da Imagem de Fundo</Label>
              <Input {...register('bannerImagemUrl')} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        {/* Sobre */}
        <Card>
          <CardContent className="pt-4">
            <Label>Texto "Sobre Nós"</Label>
            <textarea
              rows={5}
              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('textoSobre')}
            />
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Contato & Redes Sociais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>WhatsApp (apenas dígitos) *</Label>
              <Input {...register('whatsappNumero')} placeholder="5511999999999" />
            </div>
            <div>
              <Label>Instagram URL</Label>
              <Input {...register('instagramUrl')} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <Label>Facebook URL</Label>
              <Input {...register('facebookUrl')} placeholder="https://facebook.com/..." />
            </div>
          </CardContent>
        </Card>

        {/* Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Label>Endereço de Exibição</Label>
              <Input {...register('enderecoExibicao')} placeholder="Rua Exemplo, 123 - Bairro, Cidade - SP" />
            </div>
            <div>
              <Label>Latitude</Label>
              <Input type="number" step="any" {...register('latitude')} placeholder="-23.5505" />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input type="number" step="any" {...register('longitude')} placeholder="-46.6333" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
