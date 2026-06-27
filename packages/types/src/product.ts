import type { Category } from './category';

export interface ProductImage {
  id: string;
  url: string;
  ordem: number;
  alt_text?: string;
}

export interface Product {
  id: string;
  category_id: string;
  category?: Category;
  nome: string;
  descricao?: string;
  descricao_curta?: string;
  sku: string;
  preco_locacao_diaria: number;
  preco_locacao_fim_de_semana?: number;
  valor_caucao?: number;
  quantidade_total: number;
  exibir_na_vitrine: boolean;
  destaque: boolean;
  ativo: boolean;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  nome: string;
  slug?: string;
  descricao?: string;
  descricao_curta?: string;
  category_id: string;
  sku: string;
  preco_locacao_diaria: number;
  preco_locacao_fim_de_semana?: number;
  valor_caucao?: number;
  quantidade_total: number;
  exibir_na_vitrine?: boolean;
  destaque?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  ativo?: boolean;
}

export interface ProductAvailability {
  available: boolean;
  availableQuantity: number;
  requestedQuantity: number;
  startDate: string;
  endDate: string;
}
