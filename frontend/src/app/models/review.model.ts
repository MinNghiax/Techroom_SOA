export interface Review {
  id: number;
  roomId: number;             // ID phòng được đánh giá
  userId: number;             // ID người đánh giá
  username: string;           // Tên hiển thị người đánh giá (lấy từ Auth/User service)
  
  rating: number;             // Số sao (1-5)
  comment: string;            // Nội dung bình luận
  
  // Các tiện ích bổ sung nếu có
  isAnonymous?: boolean;      // Đánh giá ẩn danh
  createAt: string;           // Ngày đăng (ISO string)
}

// DTO khi người dùng gửi đánh giá mới
export interface ReviewRequest {
  roomId: number;
  rating: number;
  comment: string;
}