import type { Category } from './category';

export interface ProductImage {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  category?: Category;
  priceDiaria: number;
  priceWeekend?: number;
  quantity: number;
  showOnStorefront: boolean;
  featured: boolean;
  active: boolean;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  slug?: string;
  description?: string;
  categoryId: string;
  priceDiaria: number;
  priceWeekend?: number;
  quantity: number;
  showOnStorefront?: boolean;
  featured?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  active?: boolean;
}

export interface ProductAvailability {
  available: boolean;
  availableQuantity: number;
  requestedQuantity: number;
  startDate: string;
  endDate: string;
}
