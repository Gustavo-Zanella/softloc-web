export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  active?: boolean;
}
