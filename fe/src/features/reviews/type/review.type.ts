export interface PublicStoreItem {
  _id: string;
  store_name: string;
  store_code?: string;
  address: string;
  phone?: string;
  image_url?: string;
  operating_hours?: string;
}

export interface ReviewItem {
  _id: string;
  store_id: string;
  store_name: string;
  reviewer_name: string;
  email_masked: string;
  rating: number;
  tags: string[];
  comment: string;
  images?: string[];
  owner_reply?: string;
  replied_by_name?: string;
  replied_at?: string;
  created_at: string;
  status?: 'PUBLISHED' | 'HIDDEN';
  hidden_reason?: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  breakdown: Record<number, number>;
}

export interface ReviewListResponse {
  reviews: ReviewItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: ReviewSummary;
}

export interface RequestOtpPayload {
  store_id: string;
  email: string;
  website_hp?: string;
}

export interface SubmitReviewPayload {
  store_id: string;
  email: string;
  otp_code: string;
  reviewer_name?: string;
  rating: number;
  tags: string[];
  comment: string;
  has_images?: boolean;
}

export interface CloudinaryUploadSign {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  upload_proof: string;
}

export interface SubmitReviewResponse {
  review: ReviewItem;
  cloudinary_upload: CloudinaryUploadSign | null;
}
