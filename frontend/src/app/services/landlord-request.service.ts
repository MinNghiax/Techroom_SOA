import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LandlordRequestService {
  // Base URL chung cho controller
  private baseUrl = `${environment.apiBaseUrl}/landlord-registration`;

  constructor(private http: HttpClient) {}

  /** Lấy tất cả yêu cầu đăng ký chủ trọ cho admin */
  getAllRequests(status: string = ''): Observable<any[]> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    let url = `${this.baseUrl}/requests`; // URL: .../landlord-registration/requests
    if (status) url += `?status=${status}`;
    return this.http.get<any[]>(url, { headers });
  }

  /** Duyệt yêu cầu đăng ký chủ trọ */
  approveRequest(id: number): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    // URL: .../landlord-registration/approve/{id}
    return this.http.post(`${this.baseUrl}/approve/${id}`, {}, { headers });
  }

  /** Từ chối yêu cầu đăng ký chủ trọ */
  rejectRequest(id: number, reason: string): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    // URL: .../landlord-registration/reject/{id}?reason=...
    // Backend dùng @RequestParam nên ta gửi qua params
    return this.http.post(`${this.baseUrl}/reject/${id}`, null, { 
      headers,
      params: { reason: reason } 
    });
  }

  submitRequest(data: any): Observable<any> {
    const formData = new FormData();
    
    // Append required fields
    formData.append('cccd', data.cccd);
    formData.append('address', data.address);
    formData.append('roomCount', data.roomCount.toString());
    
    // Append required images
    if (data.frontImage) {
      formData.append('frontImage', data.frontImage);
    } else {
      throw new Error('Ảnh mặt trước CCCD là bắt buộc');
    }
    
    if (data.backImage) {
      formData.append('backImage', data.backImage);
    } else {
      throw new Error('Ảnh mặt sau CCCD là bắt buộc');
    }
    
    // Append optional license image
    if (data.licenseImage) {
      formData.append('licenseImage', data.licenseImage);
    }

    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    // Set headers with Authorization
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // URL: .../landlord-registration/register
    return this.http.post<any>(`${this.baseUrl}/register`, formData, { headers });
  }
}