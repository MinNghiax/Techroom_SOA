import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, BookingDTO, Contract } from '../models/booking.model';
import { environment } from '../../environments/environment';
import { RejectDTO } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiUrl = `${environment.apiBaseUrl}/bookings`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    // Nếu userId không tồn tại (do chưa login hoặc bị xóa), 
    // bạn nên để là '1' (ID của một user test) thay vì '0' để tránh lỗi logic database
    if (!userId || userId === 'undefined') {
        console.warn('Cảnh báo: Không tìm thấy userId trong localStorage, đang dùng ID tạm là 1');
        userId = '1'; 
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-User-Id': userId, 
      'X-Role': role || 'TENANT'
    });
}

  // 1. Tạo mới booking
  createBooking(dto: BookingDTO): Observable<ApiResponse<Contract>> {
    return this.http.post<ApiResponse<Contract>>(this.apiUrl, dto, { headers: this.getHeaders() });
  }

  // 2. Lấy danh sách cần duyệt cho CHỦ TRỌ (Backend thường là /landlord hoặc /all)
  getLandlordBookings(): Observable<ApiResponse<Contract[]>> {
    return this.http.get<ApiResponse<Contract[]>>(`${this.apiUrl}`, { headers: this.getHeaders() });
  }

  // 3. Lấy hợp đồng của người dùng hiện tại (Tenant)
  getMyContracts(): Observable<ApiResponse<Contract[]>> {
    return this.http.get<ApiResponse<Contract[]>>(`${this.apiUrl}/my-contracts`, { headers: this.getHeaders() });
  }

  /// 4. Duyệt hợp đồng
  approve(id: number): Observable<ApiResponse<any>> {
    // Backend: @PutMapping("/{id}/approve")
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}/approve`, {}, { headers: this.getHeaders() });
  }

  // 5. Từ chối hợp đồng
  reject(id: number, reason: string): Observable<ApiResponse<any>> {
    // Backend mong đợi RejectDTO: @RequestBody RejectDTO dto
    const body: RejectDTO = { reason: reason }; 
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}/reject`, body, { headers: this.getHeaders() });
  }
}