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
  name: z.string().min(2),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  priceDiaria: z.coerce.number().positive(),
  priceWeekend: z.coerce.number().optional(),
  quantity: z.coerce.number().int().positive(),
  description: z.string().optional(),
  showOnStorefront: z.boolean().default(true),
  featured: z.boolean().default(false),
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
    defaultValues: { showOnStorefront: true, featured: false },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        categoryId: product.categoryId,
        priceDiaria: product.priceDiaria,
        priceWeekend: product.priceWeekend,
        quantity: product.quantity,
        description: product.description ?? '',
        showOnStorefront: product.showOnStorefront,
        featured: product.featured,
      });
    } else if (!productId) {
      reset({ showOnStorefront: true, featured: false, quantity: 1 });
    }
  }, [product, productId, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const result = productId
        ? await api.products.update(productId, data)
        : await api.products.create(data);

      if (fileRef.current?.files?.length && result.id) {
        const file = fileRef.current.files[0];
        await api.products.uploadImage(result.id, file, true);
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
              <Input {...register('name')} placeholder="Nome do produto" />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="col-span-2">
              <Label>Categoria *</Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(v) => setValue('categoryId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-destructive text-xs mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <Label>Preço Diária (R$) *</Label>
              <Input type="number" step="0.01" {...register('priceDiaria')} />
              {errors.priceDiaria && <p className="text-destructive text-xs mt-1">{errors.priceDiaria.message}</p>}
            </div>

            <div>
              <Label>Preço Fim de Semana (R$)</Label>
              <Input type="number" step="0.01" {...register('priceWeekend')} />
            </div>

            <div>
              <Label>Quantidade em Estoque *</Label>
              <Input type="number" min="1" {...register('quantity')} />
              {errors.quantity && <p className="text-destructive text-xs mt-1">{errors.quantity.message}</p>}
            </div>

            <div className="flex flex-col gap-3 justify-end pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register('showOnStorefront')} className="rounded" />
                Exibir na vitrine
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register('featured')} className="rounded" />
                Destaque
              </label>
            </div>

            <div className="col-span-2">
              <Label>Descrição</Label>
              <textarea
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Descrição do produto..."
                {...register('description')}
              />
            </div>

            {/* Imagem principal */}
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

            {/* Imagens existentes */}
            {product?.images && product.images.length > 0 && (
              <div className="col-span-2">
                <Label className="mb-2 block">Imagens</Label>
                <div className="flex flex-wrap gap-2">
                  {product.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img src={img.url} alt="" className="h-16 w-16 rounded object-cover" />
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
