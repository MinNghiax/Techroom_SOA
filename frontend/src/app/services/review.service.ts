import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Review, ReviewRequest, ReportRequest } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiBaseUrl}/reviews`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // PHẦN DÀNH CHO NGƯỜI DÙNG (TENANT/GUEST)
  // ==========================================

  getByRoom(roomId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/room/${roomId}`);
  }

  createReview(request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, request);
  }

  // MỚI: Cập nhật đánh giá của chính mình
  updateReview(id: number, request: ReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}`, request);
  }

  // MỚI: Xóa đánh giá của chính mình
  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // MỚI: Gửi báo cáo vi phạm
  reportReview(reviewId: number, reason: string, description: string): Observable<void> {
    const params = new HttpParams()
      .set('reviewId', reviewId)
      .set('reason', reason)
      .set('description', description);
    return this.http.post<void>(`${this.apiUrl}/reports`, null, { params });
  }

  // ==========================================
  // PHẦN DÀNH CHO ADMIN (XỬ LÝ BÁO CÁO)
  // ==========================================

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  // Lấy danh sách báo cáo cho Admin
  getAdminReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports`);
  }

  // FIX LỖI: Phương thức cập nhật trạng thái báo cáo
  updateReportStatus(reportId: number, status: string): Observable<void> {
    const params = new HttpParams().set('status', status);
    return this.http.put<void>(`${this.apiUrl}/reports/${reportId}/status`, {}, { params });
  }

  // Admin xóa review vi phạm
  deleteReviewByReport(reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reports/${reportId}/review`);
  }
}