import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipeIngredient {
  material_id?: mongoose.Types.ObjectId | null;
  material_name: string;
  quantity: number;
  unit: string;
  cost?: number;
  notes?: string | null;
}

export interface IRecipeStep {
  step_number: number;
  title: string;
  instruction: string;
  duration_seconds?: number | null;
  tips?: string | null;
}

export interface IRecipeDoc extends Document {
  store_id?: mongoose.Types.ObjectId | string | null;
  name: string;
  code: string;
  type: 'internal_prep' | 'customer_product';
  category_id?: mongoose.Types.ObjectId | string | null;
  category: string;
  price: number;
  estimated_cost: number;
  description?: string | null;
  image_url?: string | null;
  serving_size?: string;
  serving_mode?: 'cold' | 'hot' | 'both' | string;
  cold_cup_id?: mongoose.Types.ObjectId | string | null;
  cold_cup_name?: string | null;
  hot_cup_id?: mongoose.Types.ObjectId | string | null;
  hot_cup_name?: string | null;
  prep_time_minutes: number;
  shelf_life?: string | null;
  storage_method?: string | null;
  ingredients: IRecipeIngredient[];
  steps: IRecipeStep[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const RecipeIngredientSchema = new Schema<IRecipeIngredient>(
  {
    material_id: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      default: null,
    },
    material_name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { _id: false }
);

const RecipeStepSchema = new Schema<IRecipeStep>(
  {
    step_number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    instruction: {
      type: String,
      required: true,
      trim: true,
    },
    duration_seconds: {
      type: Number,
      default: null,
    },
    tips: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { _id: false }
);

const RecipeSchema = new Schema<IRecipeDoc>(
  {
    store_id: {
      type: Schema.Types.ObjectId,
      ref: 'StoreConfig',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['internal_prep', 'customer_product'],
      default: 'customer_product',
      index: true,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: 'RecipeCategory',
      default: null,
      index: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Trà trái cây',
      index: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimated_cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    image_url: {
      type: String,
      default: null,
      trim: true,
    },
    serving_size: {
      type: String,
      default: '1 ly',
      trim: true,
    },
    serving_mode: {
      type: String,
      enum: ['cold', 'hot', 'both'],
      default: 'cold',
      index: true,
    },
    cold_cup_id: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      default: null,
    },
    cold_cup_name: {
      type: String,
      default: null,
      trim: true,
    },
    hot_cup_id: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      default: null,
    },
    hot_cup_name: {
      type: String,
      default: null,
      trim: true,
    },
    prep_time_minutes: {
      type: Number,
      default: 5,
    },
    shelf_life: {
      type: String,
      default: null,
      trim: true,
    },
    storage_method: {
      type: String,
      default: null,
      trim: true,
    },
    ingredients: {
      type: [RecipeIngredientSchema],
      default: [],
    },
    steps: {
      type: [RecipeStepSchema],
      default: [],
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'recipes',
  }
);

RecipeSchema.index({ store_id: 1, type: 1 });
RecipeSchema.index({ store_id: 1, category: 1 });

export const RecipeModel =
  mongoose.models.Recipe || mongoose.model<IRecipeDoc>('Recipe', RecipeSchema);
