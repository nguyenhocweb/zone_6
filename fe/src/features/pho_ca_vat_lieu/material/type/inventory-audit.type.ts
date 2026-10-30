export interface InventoryAuditItem {
  material_id: string;
  material_code: string;
  material_name: string;
  category: 'packaging' | 'ingredient' | 'topping';
  unit: string;
  system_quantity: number;
  actual_quantity: number;
  difference: number;
  count_mode: 'single' | 'batch';
  pack_count?: number | null;
  pack_size?: number | null;
  loose_count?: number | null;
  notes?: string | null;
}

export interface InventoryAudit {
  _id: string;
  audit_code: string;
  store_id: string;
  created_by_id: string;
  created_by_name: string;
  created_by_user_code?: string | null;
  created_by_email?: string | null;
  created_by_role: string;
  audit_shift?: string | null; // Ca kiểm kho (Ca sáng, Ca chiều, Ca tối...)
  items: InventoryAuditItem[];
  total_items_checked: number;
  discrepancy_count: number;
  status: 'pending_review' | 'adjusted' | 'confirmed';
  reviewed_by_id?: string | null;
  reviewed_by_name?: string | null;
  reviewed_by_user_code?: string | null;
  reviewed_by_role?: string | null;
  reviewed_at?: string | null;
  adjustment_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryAuditCreatePayload {
  store_id: string;
  audit_shift?: string | null;
  items: InventoryAuditItem[];
  adjustment_notes?: string | null;
}

export interface InventoryAuditUpdatePayload {
  items?: InventoryAuditItem[];
  status?: 'pending_review' | 'adjusted' | 'confirmed';
  adjustment_notes?: string | null;
  apply_to_stock?: boolean;
}

export interface AuditShiftConfig {
  shift_id: string;
  shift_name: string;
  start_time?: string | null;
  end_time?: string | null;
  is_required: boolean;
}

export interface InventoryAuditScheduleStatus {
  today_is_due: boolean;
  next_due_date: string;
  target_shifts_today: AuditShiftConfig[];
  completed_shifts_today: string[];
  is_today_completed: boolean;
  last_audit_date?: string | null;
}

export interface InventoryAuditConfig {
  id: string;
  store_id?: string | null;
  store_name?: string | null;
  allowed_creator_roles: string[];
  allowed_reviewer_roles: string[];
  audit_shifts: AuditShiftConfig[];
  frequency_type: 'daily' | 'interval_days' | 'weekly';
  interval_days: number;
  days_of_week: number[];
  reminder_time: string;
  is_active: boolean;
  schedule_status?: InventoryAuditScheduleStatus;
  updated_by_id?: string | null;
  updated_by_name?: string | null;
  updated_by_role?: string | null;
  updated_at: string;
}

export interface InventoryAuditConfigUpdatePayload {
  store_id?: string | null;
  allowed_creator_roles: string[];
  allowed_reviewer_roles: string[];
  audit_shifts: AuditShiftConfig[];
  frequency_type: 'daily' | 'interval_days' | 'weekly';
  interval_days: number;
  days_of_week: number[];
  reminder_time: string;
  is_active: boolean;
}
