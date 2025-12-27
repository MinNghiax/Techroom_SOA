import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BookingRequest } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // Đi qua Gateway Port 8080 để đến Booking Service
  private apiUrl = `${environment.apiBaseUrl}/bookings`;

  constructor(private http: HttpClient) {}

  // Tạo yêu cầu đặt phòng (Tenant)
  createBooking(dto: BookingRequest): Observable<any> {
    // Không gửi tenantId, chỉ gửi các trường BookingRequest
    const {
      roomId,
      landlordId,
      fullName,
      cccd,
      phone,
      address,
      startDate,
      endDate,
      deposit,
      monthlyRent,
      notes
    } = dto;
    return this.http.post<any>(this.apiUrl, {
      roomId,
      landlordId,
      fullName,
      cccd,
      phone,
      address,
      startDate,
      endDate,
      deposit,
      monthlyRent,
      notes
    });
  }

  // Xem danh sách hợp đồng cá nhân (Tenant)
  getTenantContracts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-contracts`);
  }

  // Lấy tất cả booking (Admin/Staff)
  getAllBookings(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Duyệt hợp đồng (Landlord)
  approveBooking(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/approve`, {});
  }
}