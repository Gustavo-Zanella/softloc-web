export interface Category {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryDto {
  nome: string;
  slug?: string;
  descricao?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  ativo?: boolean;
}
