export interface RecipeIngredient {
  material_id?: string | null;
  material_name: string;
  quantity: number;
  unit: string;
  cost?: number;
  notes?: string | null;
}

export interface RecipeStep {
  step_number: number;
  title: string;
  instruction: string;
  duration_seconds?: number | null;
  tips?: string | null;
}

export interface Recipe {
  id: string;
  _id?: string;
  store_id?: string | null;
  name: string;
  code: string;
  type: 'internal_prep' | 'customer_product';
  category_id?: string | null;
  category: string;
  price: number;
  estimated_cost?: number;
  description: string | null;
  image_url: string | null;
  serving_size: string;
  serving_mode?: 'cold' | 'hot' | 'both';
  cold_cup_id?: string | null;
  cold_cup_name?: string | null;
  hot_cup_id?: string | null;
  hot_cup_name?: string | null;
  prep_time_minutes: number;
  shelf_life: string | null;
  storage_method: string | null;
  ingredients_count: number;
  steps_count: number;
  has_recipe_access: boolean;
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeListResponse {
  recipes: Recipe[];
  total: number;
  internal_prep_count: number;
  customer_product_count: number;
}

export type RecipeListParams = {
  store_id?: string;
  type?: string;
  category?: string;
  search?: string;
  is_active?: boolean;
  [key: string]: unknown;
};

export interface RecipeCreatePayload {
  store_id?: string | null;
  name: string;
  code?: string;
  type: 'internal_prep' | 'customer_product';
  category_id?: string | null;
  category: string;
  price?: number;
  estimated_cost?: number;
  description?: string | null;
  image_url?: string | null;
  serving_size?: string;
  serving_mode?: 'cold' | 'hot' | 'both';
  cold_cup_id?: string | null;
  cold_cup_name?: string | null;
  hot_cup_id?: string | null;
  hot_cup_name?: string | null;
  prep_time_minutes?: number;
  shelf_life?: string | null;
  storage_method?: string | null;
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
  is_active?: boolean;
}

export type RecipeUpdatePayload = Partial<RecipeCreatePayload>;

