'use client';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/use-api';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@softloc/ui';
import type { Category } from '@softloc/types';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

const schema = z.object({
  nome: z.string().min(2),
  category_id: z.string().min(1, 'Selecione uma categoria'),
  sku: z.string().min(1),
  preco_locacao_diaria: z.coerce.number().positive(),
  preco_locacao_fim_de_semana: z.coerce.number().optional(),
  valor_caucao: z.coerce.number().optional(),
  quantidade_total: z.coerce.number().int().positive(),
  descricao: z.string().optional(),
  descricao_curta: z.string().optional(),
  exibir_na_vitrine: z.boolean().default(true),
  destaque: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  productId?: string | null;
  categories: Category[];
}

export function ProductDialog({ open, onClose, productId, categories }: ProductDialogProps) {
  const api = useApi();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => api.products.get(productId!),
    enabled: !!productId && open,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { exibir_na_vitrine: true, destaque: false },
  });

  useEffect(() => {
    if (product) {
      reset({
        nome: product.nome,
        category_id: product.category_id,
        sku: product.sku,
        preco_locacao_diaria: product.preco_locacao_diaria,
        preco_locacao_fim_de_semana: product.preco_locacao_fim_de_semana,
        valor_caucao: product.valor_caucao,
        quantidade_total: product.quantidade_total,
        descricao: product.descricao ?? '',
        descricao_curta: product.descricao_curta ?? '',
        exibir_na_vitrine: product.exibir_na_vitrine,
        destaque: product.destaque,
      });
    } else if (!productId) {
      reset({ exibir_na_vitrine: true, destaque: false, quantidade_total: 1 });
    }
  }, [product, productId, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const result = productId
        ? await api.products.update(productId, data)
        : await api.products.create(data);

      if (fileRef.current?.files?.length && result.id) {
        await api.products.uploadImage(result.id, fileRef.current.files[0], true);
      }
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success(productId ? 'Produto atualizado.' : 'Produto criado.');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => api.products.deleteImage(productId!, imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['product', productId] }),
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{productId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome *</Label>
              <Input {...register('nome')} placeholder="Nome do produto" />
              {errors.nome && <p className="text-destructive text-xs mt-1">{errors.nome.message}</p>}
            </div>

            <div>
              <Label>SKU *</Label>
              <Input {...register('sku')} placeholder="PROD-001" />
              {errors.sku && <p className="text-destructive text-xs mt-1">{errors.sku.message}</p>}
            </div>

            <div>
              <Label>Categoria *</Label>
              <Select value={watch('category_id')} onValueChange={(v) => setValue('category_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-destructive text-xs mt-1">{errors.category_id.message}</p>}
            </div>

            <div>
              <Label>Preço Diária (R$) *</Label>
              <Input type="number" step="0.01" {...register('preco_locacao_diaria')} />
              {errors.preco_locacao_diaria && <p className="text-destructive text-xs mt-1">{errors.preco_locacao_diaria.message}</p>}
            </div>

            <div>
              <Label>Preço Fim de Semana (R$)</Label>
              <Input type="number" step="0.01" {...register('preco_locacao_fim_de_semana')} />
            </div>

            <div>
              <Label>Caução (R$)</Label>
              <Input type="number" step="0.01" {...register('valor_caucao')} />
            </div>

            <div>
              <Label>Qtd. em Estoque *</Label>
              <Input type="number" min="1" {...register('quantidade_total')} />
              {errors.quantidade_total && <p className="text-destructive text-xs mt-1">{errors.quantidade_total.message}</p>}
            </div>

            <div className="col-span-2 flex gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register('exibir_na_vitrine')} className="rounded" />
                Exibir na vitrine
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register('destaque')} className="rounded" />
                Destaque
              </label>
            </div>

            <div className="col-span-2">
              <Label>Descrição curta</Label>
              <Input {...register('descricao_curta')} placeholder="Resumo para listagem..." />
            </div>

            <div className="col-span-2">
              <Label>Descrição completa</Label>
              <textarea
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Descrição detalhada..."
                {...register('descricao')}
              />
            </div>

            <div className="col-span-2">
              <Label>Foto Principal</Label>
              <div
                className="mt-1 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">Clique para selecionar uma imagem</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" />
            </div>

            {product?.images && product.images.length > 0 && (
              <div className="col-span-2">
                <Label className="mb-2 block">Imagens</Label>
                <div className="flex flex-wrap gap-2">
                  {product.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img src={img.url} alt={img.alt_text ?? ''} className="h-16 w-16 rounded object-cover" />
                      <button
                        type="button"
                        onClick={() => deleteImageMutation.mutate(img.id)}
                        className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
