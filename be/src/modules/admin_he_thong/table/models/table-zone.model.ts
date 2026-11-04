import mongoose, { Schema, Document } from 'mongoose';

export interface ITableZoneDoc extends Document {
  store_id: mongoose.Types.ObjectId;
  name: string;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const TableZoneSchema = new Schema<ITableZoneDoc>(
  {
    store_id: {
      type: Schema.Types.ObjectId,
      ref: 'store_configs',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'table_zones',
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

TableZoneSchema.index({ store_id: 1, name: 1 }, { unique: true });

export const TableZoneModel =
  mongoose.models.TableZone || mongoose.model<ITableZoneDoc>('TableZone', TableZoneSchema);

