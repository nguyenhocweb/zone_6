export interface RecipeCategory {
  id: string;
  _id?: string;
  name: string;
  code: string | null;
  description: string | null;
  type: 'customer_product' | 'internal_prep' | 'both' | string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeCategoryListResponse {
  categories: RecipeCategory[];
  total: number;
}

export interface RecipeCategoryCreatePayload {
  name: string;
  code?: string;
  description?: string | null;
  type?: 'customer_product' | 'internal_prep' | 'both';
  is_active?: boolean;
}
