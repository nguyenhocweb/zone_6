export interface Subscription {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  max_projects: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedSubscriptionsResponse {
  items: Subscription[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SubscriptionFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
}
