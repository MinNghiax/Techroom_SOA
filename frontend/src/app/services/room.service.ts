import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomResponse, RoomRequest } from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  // Tập trung URL về một mối, sử dụng environment để linh hoạt khi deploy
  private readonly apiUrl = `${environment.apiBaseUrl}/rooms`;

  constructor(private http: HttpClient) {}

  // 1. Lấy tất cả phòng (cho trang chủ/tìm kiếm)
  getRooms(): Observable<RoomResponse[]> {
    return this.http.get<RoomResponse[]>(this.apiUrl);
  }

  // 2. Lấy chi tiết 1 phòng theo ID
  getRoomById(id: number): Observable<RoomResponse> {
    return this.http.get<RoomResponse>(`${this.apiUrl}/${id}`);
  }

  // 3. Lấy danh sách phòng dành riêng cho Chủ nhà (Landlord)
  getRoomsByLandlord(): Observable<RoomResponse[]> {
    return this.http.get<RoomResponse[]>(`${this.apiUrl}/landlord`);
  }

  // 4. Tạo phòng mới
  createRoom(data: RoomRequest): Observable<RoomResponse> {
    return this.http.post<RoomResponse>(this.apiUrl, data);
  }

  // 5. Cập nhật thông tin phòng
  updateRoom(id: number, data: RoomRequest): Observable<RoomResponse> {
    return this.http.put<RoomResponse>(`${this.apiUrl}/${id}`, data);
  }

  // 6. Xóa phòng
  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}