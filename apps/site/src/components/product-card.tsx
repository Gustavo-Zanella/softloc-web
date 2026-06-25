import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import type { StorefrontProduct } from '@softloc/types';
import { Card, CardContent, Button } from '@softloc/ui';
import { formatCurrency } from '@softloc/ui';

interface ProductCardProps {
  product: StorefrontProduct;
  whatsapp?: string;
}

export function ProductCard({ product, whatsapp }: ProductCardProps) {
  const primaryImage = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
  const waMessage = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name}`)}`
    : null;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/produtos/${product.slug}`}>
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Sem imagem
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/produtos/${product.slug}`}>
          <h3 className="font-semibold text-sm mb-1 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-primary font-bold text-lg mb-3">
          {formatCurrency(product.priceDiaria)}<span className="text-xs font-normal text-muted-foreground">/dia</span>
        </p>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/produtos/${product.slug}`}>Ver detalhes</Link>
          </Button>
          {waMessage && (
            <Button asChild size="sm" className="bg-green-500 hover:bg-green-600 text-white px-2">
              <a href={waMessage} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
