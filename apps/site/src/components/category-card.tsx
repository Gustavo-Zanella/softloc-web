import Link from 'next/link';
import Image from 'next/image';
import type { StorefrontCategory } from '@softloc/types';

interface CategoryCardProps {
  category: StorefrontCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow"
    >
      {category.imageUrl && (
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-white font-semibold text-sm text-center">{category.name}</h3>
      </div>
    </Link>
  );
}
