import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipeCategoryDoc extends Document {
  name: string;
  code?: string | null;
  description?: string | null;
  type?: 'customer_product' | 'internal_prep' | 'both';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const RecipeCategorySchema = new Schema<IRecipeCategoryDoc>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    type: {
      type: String,
      enum: ['customer_product', 'internal_prep', 'both'],
      default: 'both',
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'recipe_categories',
  }
);

export const RecipeCategoryModel =
  mongoose.models.RecipeCategory ||
  mongoose.model<IRecipeCategoryDoc>('RecipeCategory', RecipeCategorySchema);
