export interface Review {
  id: number;
  roomId: number;
  tenantId: number;   // ID người dùng (userId từ auth_db)
  username: string;   // Full Name hiển thị
  rating: number;
  comment: string;
  createdAt: string;
}

// DTO gửi đánh giá mới hoặc cập nhật
export interface ReviewRequest {
  roomId: number;
  rating: number;
  comment: string;
}

// Interface phục vụ gửi báo cáo
export interface ReportRequest {
  reviewId: number;
  reason: string;
  description: string;
}

// Interface dành cho Admin nhận dữ liệu báo cáo phẳng
export interface ReviewReportResponse {
  id: number;
  reviewId: number;
  reviewComment: string;
  reporterId: number;
  reporterName: string; // Tên hiển thị người báo cáo
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}