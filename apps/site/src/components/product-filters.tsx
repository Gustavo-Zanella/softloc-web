'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import type { StorefrontCategory } from '@softloc/types';
import { Input } from '@softloc/ui';
import { Search } from 'lucide-react';

interface ProductFiltersProps {
  categories: StorefrontCategory[];
  currentCategory?: string;
  currentSearch?: string;
}

export function ProductFilters({ categories, currentCategory, currentSearch }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback(
    (params: Record<string, string | undefined>) => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
      router.push(`${pathname}?${qs.toString()}`);
    },
    [router, pathname]
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Buscar</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nome do produto..."
            className="pl-9"
            defaultValue={currentSearch}
            onChange={(e) => navigate({ search: e.target.value, categorySlug: currentCategory })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Categorias</label>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate({ categorySlug: undefined, search: currentSearch })}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${!currentCategory ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
            >
              Todas as categorias
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => navigate({ categorySlug: cat.slug, search: currentSearch })}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${currentCategory === cat.slug ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
