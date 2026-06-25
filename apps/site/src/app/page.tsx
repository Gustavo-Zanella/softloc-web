import Image from 'next/image';
import Link from 'next/link';
import { storefrontApi } from '@/lib/api';
import { ProductCard } from '@/components/product-card';
import { CategoryCard } from '@/components/category-card';
import { Button } from '@softloc/ui';
import { ArrowRight, MessageCircle } from 'lucide-react';

export const revalidate = 300;

export default async function HomePage() {
  const [settings, categoriesRes, featuredRes] = await Promise.allSettled([
    storefrontApi.getSettings(),
    storefrontApi.getCategories(),
    storefrontApi.getProducts({ featured: true, limit: 8 }),
  ]);

  const s = settings.status === 'fulfilled' ? settings.value : null;
  const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : [];
  const featured = featuredRes.status === 'fulfilled' ? featuredRes.value.data : [];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-white overflow-hidden">
        {s?.bannerImagemUrl ? (
          <Image
            src={s.bannerImagemUrl}
            alt="Banner"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {s?.bannerTitulo ?? 'Locação de itens para festas e eventos'}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            {s?.bannerSubtitulo ?? 'Qualidade e elegância para tornar sua celebração inesquecível.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="xl" variant="gold">
              <Link href="/produtos">
                Ver Catálogo <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            {s?.whatsappNumero && (
              <Button asChild size="xl" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-gray-900">
                <a href={`https://wa.me/${s.whatsappNumero}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" /> Solicitar Orçamento
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Categorias */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-center mb-2">Categorias</h2>
            <p className="text-muted-foreground text-center mb-10">Explore nossa variedade de itens para locação</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Destaques */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-center mb-2">Destaques</h2>
            <p className="text-muted-foreground text-center mb-10">Os mais procurados para suas festas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} whatsapp={s?.whatsappNumero} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Button asChild variant="outline" size="lg">
                <Link href="/produtos">Ver todos os produtos <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Sobre */}
      {s?.textoSobre && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold mb-6">Sobre Nós</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{s.textoSobre}</p>
          </div>
        </section>
      )}

      {/* CTA WhatsApp */}
      {s?.whatsappNumero && (
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold mb-4">Pronto para celebrar?</h2>
            <p className="mb-8 text-primary-foreground/80">
              Entre em contato pelo WhatsApp e solicite seu orçamento personalizado.
            </p>
            <Button asChild size="xl" className="bg-white text-primary hover:bg-white/90">
              <a href={`https://wa.me/${s.whatsappNumero}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
              </a>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
