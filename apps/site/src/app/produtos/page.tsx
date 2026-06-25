import type { Metadata } from 'next';
import { storefrontApi } from '@/lib/api';
import { ProductCard } from '@/components/product-card';
import { ProductFilters } from '@/components/product-filters';

export const metadata: Metadata = {
  title: 'Catálogo de Produtos',
  description: 'Explore nosso catálogo completo de itens para locação de festas e eventos.',
};

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ page?: string; categorySlug?: string; search?: string }>;
}

export default async function ProdutosPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const categorySlug = params.categorySlug;
  const search = params.search;

  const [productsRes, categoriesRes, settingsRes] = await Promise.allSettled([
    storefrontApi.getProducts({ page, limit: 12, categorySlug, search }),
    storefrontApi.getCategories(),
    storefrontApi.getSettings(),
  ]);

  const result = productsRes.status === 'fulfilled' ? productsRes.value : { data: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : [];
  const settings = settingsRes.status === 'fulfilled' ? settingsRes.value : null;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Catálogo</h1>
      <p className="text-muted-foreground mb-8">
        {result.total} produto{result.total !== 1 ? 's' : ''} disponíve{result.total !== 1 ? 'is' : 'l'}
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <ProductFilters categories={categories} currentCategory={categorySlug} currentSearch={search} />
        </aside>

        <div className="flex-1">
          {result.data.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.data.map((product) => (
                  <ProductCard key={product.id} product={product} whatsapp={settings?.whatsappNumero} />
                ))}
              </div>

              {result.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`?page=${p}${categorySlug ? `&categorySlug=${categorySlug}` : ''}${search ? `&search=${search}` : ''}`}
                      className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${p === page ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted border-border'}`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
