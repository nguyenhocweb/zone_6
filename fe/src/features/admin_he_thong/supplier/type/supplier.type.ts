export interface SuppliedMaterial {
  material_id: string;
  material_code: string;
  material_name: string;
  category: 'packaging' | 'ingredient' | 'topping';
  unit: string;
  supply_price?: number | null;
}

export interface Supplier {
  _id: string;
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contact_person?: string | null;
  supplied_materials: SuppliedMaterial[];
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierCreatePayload {
  code?: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contact_person?: string | null;
  supplied_materials?: SuppliedMaterial[];
  notes?: string | null;
  is_active?: boolean;
}

export interface SupplierUpdatePayload {
  code?: string;
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contact_person?: string | null;
  supplied_materials?: SuppliedMaterial[];
  notes?: string | null;
  is_active?: boolean;
}
