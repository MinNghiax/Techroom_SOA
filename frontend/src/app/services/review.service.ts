import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReviewRequest } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiBaseUrl}/reviews`;

  constructor(private http: HttpClient) {}

  // Lấy danh sách đánh giá theo ID phòng
  getByRoom(roomId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/room/${roomId}`);
  }

  // Gửi đánh giá mới (Tenant)
  createReview(request: ReviewRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request);
  }

  // Lấy toàn bộ đánh giá (Admin)
  getAllReviews(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}