export const queryKeys = {
  subscriptions: {
    all: ["subscriptions"] as const,
    list: (params?: Record<string, unknown>) => ["subscriptions", "list", params] as const,
    detail: (id: string) => ["subscriptions", "detail", id] as const,
  },
  zalo: {
    all: ["zalo"] as const,
    status: ["zalo", "status"] as const,
    qr: (id: string) => ["zalo", "qr", id] as const,
    config: ["zalo", "config"] as const,
    channels: (storeId?: string | null) => ["zalo", "channels", storeId ?? "default"] as const,
    groups: ["zalo", "groups"] as const,
  },
  auth: {
    all: ["auth"] as const,
    me: ["auth", "me"] as const,
    roles: ["auth", "roles"] as const,
  },
  scheduling: {
    all: ["scheduling"] as const,
    notifications: (params?: Record<string, unknown>) =>
      ["scheduling", "notifications", params] as const,
  },
  staff: {
    all: ["staff"] as const,
    list: (params?: Record<string, unknown>) => ["staff", "list", params] as const,
  },
  checkinConfig: {
    all: ["checkinConfig"] as const,
    current: ["checkinConfig", "current"] as const,
    byStore: (storeId?: string | null) => ["checkinConfig", "store", storeId ?? "default"] as const,
  },
  stores: {
    all: ["stores"] as const,
    list: (params?: Record<string, unknown>) => ["stores", "list", params] as const,
    detail: (id: string) => ["stores", "detail", id] as const,
  },
  materials: {
    all: ["materials"] as const,
    list: (params?: Record<string, unknown>) => ["materials", "list", params] as const,
    detail: (id: string) => ["materials", "detail", id] as const,
  },
  recipes: {
    all: ["recipes"] as const,
    list: (params?: Record<string, unknown>) => ["recipes", "list", params] as const,
    detail: (id: string) => ["recipes", "detail", id] as const,
    categories: (params?: Record<string, unknown>) => ["recipes", "categories", params] as const,
  },
  sellableToppings: {
    all: ["sellableToppings"] as const,
    list: (params?: Record<string, unknown>) => ["sellableToppings", "list", params] as const,
    detail: (id: string) => ["sellableToppings", "detail", id] as const,
  },
  inventoryAudits: {
    all: ["inventoryAudits"] as const,
    list: (params?: Record<string, unknown>) => ["inventoryAudits", "list", params] as const,
    detail: (id: string) => ["inventoryAudits", "detail", id] as const,
    config: (storeId?: string | null) => ["inventoryAudits", "config", storeId ?? "default"] as const,
  },
  suppliers: {
    all: ["suppliers"] as const,
    list: (params?: Record<string, unknown>) => ["suppliers", "list", params] as const,
    detail: (id: string) => ["suppliers", "detail", id] as const,
  },
  shiftConfigs: {
    all: ["shiftConfigs"] as const,
    list: (storeId?: string | null) => ["shiftConfigs", "list", storeId ?? "default"] as const,
    detail: (id: string) => ["shiftConfigs", "detail", id] as const,
  },
} as const;
