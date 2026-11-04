import { Request, Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { StoreConfigModel } from '../../admin_he_thong/store-config/models/store-config.model.js';
import { TableModel } from '../../admin_he_thong/table/models/table.model.js';

export const getPublicStoresAndTablesController = asyncHandler(async (_req: Request, res: Response) => {
  const stores = await StoreConfigModel.find({ is_active: true })
    .select('_id store_name store_code address phone ordering_mode table_geofence_radius_meters latitude longitude')
    .lean();

  const storeIds = stores.map((s) => s._id);
  const tables = await TableModel.find({
    store_id: { $in: storeIds },
    is_active: true,
  })
    .select('_id store_id table_number zone_name status qr_token capacity')
    .sort({ zone_name: 1, table_number: 1 })
    .lean();

  const data = stores.map((store) => ({
    id: store._id.toString(),
    name: store.store_name,
    code: store.store_code,
    address: store.address,
    tables: tables
      .filter((t) => t.store_id.toString() === store._id.toString())
      .map((t) => ({
        id: t._id.toString(),
        tableNumber: t.table_number,
        zoneName: t.zone_name,
        status: t.status,
        qrToken: t.qr_token,
      })),
  }));

  res.json({
    success: true,
    data,
  });
});
