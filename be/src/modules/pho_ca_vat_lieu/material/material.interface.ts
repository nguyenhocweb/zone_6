/**
 * PHÂN HỆ QUẢN LÝ VẬT LIỆU & KHO HÀNG (CN11)
 * Dành riêng cho: Phó Ca Vật Liệu (pho_ca_vat_lieu) & Quản Lý (quan_ly)
 */
export interface MaterialInventoryItem {
  id: string;
  store_id: string;
  item_name: string;
  category: string;
  unit: string;
  quantity_in_stock: number;
  min_threshold: number;
  last_audited_at: Date;
}
