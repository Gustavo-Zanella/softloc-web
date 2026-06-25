import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { storefrontApi } from '@/lib/api';
import { AvailabilityChecker } from '@/components/availability-checker';
import { formatCurrency } from '@softloc/ui';
import { MessageCircle, ChevronLeft } from 'lucide-react';
import { Button } from '@softloc/ui';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await storefrontApi.getProductBySlug(slug);
    return {
      title: product.name,
      description: product.description ?? `Locação de ${product.name}`,
      openGraph: {
        title: product.name,
        images: product.images?.map((i) => i.url) ?? [],
      },
    };
  } catch {
    return { title: 'Produto não encontrado' };
  }
}

export const revalidate = 60;

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product;
  let settings = null;
  try {
    [product, settings] = await Promise.all([
      storefrontApi.getProductBySlug(slug),
      storefrontApi.getSettings().catch(() => null),
    ]);
  } catch {
    notFound();
  }

  const primaryImage = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
  const otherImages = product.images?.filter((i) => !i.isPrimary) ?? [];

  return (
    <div className="container mx-auto px-4 py-10">
      <Link href="/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" /> Voltar ao catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Galeria */}
        <div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Sem imagem</div>
            )}
          </div>
          {otherImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {otherImages.slice(0, 4).map((img) => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image src={img.url} alt={product.name} fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <Link href={`/categorias/${product.category.slug}`}
              className="text-sm text-primary hover:underline mb-2 block">
              {product.category.name}
            </Link>
          )}
          <h1 className="font-display text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex gap-6 mb-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Diária</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(product.priceDiaria)}</p>
            </div>
            {product.priceWeekend && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Fim de semana</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(product.priceWeekend)}</p>
              </div>
            )}
          </div>

          {product.description && (
            <div className="prose prose-sm max-w-none mb-8 text-gray-600 leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}

          <AvailabilityChecker
            productId={product.id}
            productName={product.name}
            whatsapp={settings?.whatsappNumero}
          />
        </div>
      </div>
    </div>
  );
}
