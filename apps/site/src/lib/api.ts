import type {
  SiteSettings,
  StorefrontCategory,
  StorefrontProduct,
  StorefrontProductDetail,
  ProductAvailability,
  ContactFormDto,
  PaginatedResponse,
} from '@softloc/types';

const API_URL =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000');

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(err.message ?? 'Erro na API');
  }
  return res.json() as Promise<T>;
}

export const storefrontApi = {
  getSettings: () =>
    apiFetch<SiteSettings>('/storefront/settings', { next: { revalidate: 300 } }),

  getCategories: () =>
    apiFetch<StorefrontCategory[]>('/storefront/categories', { next: { revalidate: 300 } }),

  getProducts: (params?: {
    page?: number;
    limit?: number;
    categorySlug?: string;
    search?: string;
    featured?: boolean;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.categorySlug) qs.set('categorySlug', params.categorySlug);
    if (params?.search) qs.set('search', params.search);
    if (params?.featured) qs.set('featured', 'true');
    return apiFetch<PaginatedResponse<StorefrontProduct>>(
      `/storefront/products?${qs.toString()}`,
      { next: { revalidate: 60 } }
    );
  },

  getProductBySlug: (slug: string) =>
    apiFetch<StorefrontProductDetail>(`/storefront/products/${slug}`, {
      next: { revalidate: 60 },
    }),

  getProductAvailability: (productId: string, startDate: string, endDate: string, quantity: number) =>
    apiFetch<ProductAvailability>(
      `/storefront/products/${productId}/availability?startDate=${startDate}&endDate=${endDate}&quantity=${quantity}`
    ),

  submitContact: (dto: ContactFormDto) =>
    apiFetch<{ message: string }>('/storefront/contact', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
};
