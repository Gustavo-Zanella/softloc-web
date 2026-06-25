import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { storefrontApi } from '@/lib/api';
import { ProductCard } from '@/components/product-card';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await storefrontApi.getCategories().catch(() => []);
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return { title: 'Categoria não encontrada' };
  return { title: cat.name, description: cat.description ?? `Produtos da categoria ${cat.name}` };
}

export const revalidate = 60;

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  const [categoriesRes, productsRes, settingsRes] = await Promise.allSettled([
    storefrontApi.getCategories(),
    storefrontApi.getProducts({ page, limit: 12, categorySlug: slug }),
    storefrontApi.getSettings(),
  ]);

  const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : [];
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const result = productsRes.status === 'fulfilled'
    ? productsRes.value
    : { data: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  const settings = settingsRes.status === 'fulfilled' ? settingsRes.value : null;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-muted-foreground mb-8">{category.description}</p>
      )}

      {result.data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Nenhum produto nesta categoria.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {result.data.map((product) => (
              <ProductCard key={product.id} product={product} whatsapp={settings?.whatsappNumero} />
            ))}
          </div>
          {result.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?page=${p}`}
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
  );
}
