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
  },
} as const;
