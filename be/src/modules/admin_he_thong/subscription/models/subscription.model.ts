import { Schema, model, type Document } from 'mongoose';

export interface ISubscriptionDoc extends Document {
  name: string;
  description?: string | null;
  price: number;
  duration_days: number;
  max_projects: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const subscriptionSchema = new Schema<ISubscriptionDoc>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      default: null,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    duration_days: {
      type: Number,
      required: true,
      min: 1,
      default: 30,
    },
    max_projects: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    is_active: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    versionKey: false,
  }
);

export const SubscriptionModel = model<ISubscriptionDoc>('Subscription', subscriptionSchema);
