import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RoomResponse, RoomRequest, Amenity } from '../models/room.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly apiUrl = `${environment.apiBaseUrl}/rooms`;

  constructor(private http: HttpClient) {}

  getRooms(): Observable<RoomResponse[]> {
    return this.http.get<RoomResponse[]>(this.apiUrl);
  }

  getRoomsByLandlord(): Observable<RoomResponse[]> {
    const landlordId = localStorage.getItem('userId');
    const headers = new HttpHeaders().set('X-User-Id', landlordId ? landlordId : '');
    return this.http.get<RoomResponse[]>(`${this.apiUrl}/landlord`, { headers });
  }

  getRoomById(id: number): Observable<RoomResponse> {
    return this.http.get<RoomResponse>(`${this.apiUrl}/${id}`);
  }

  createRoom(data: RoomRequest, files: File[]): Observable<RoomResponse> {
    const formData = new FormData();
    formData.append('room', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    files.forEach(file => formData.append('images', file));
    return this.http.post<RoomResponse>(this.apiUrl, formData);
  }

  updateRoom(id: number, data: RoomRequest, files: File[]): Observable<RoomResponse> {
    const formData = new FormData();
    formData.append('room', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (files.length > 0) {
      files.forEach(file => formData.append('images', file));
    }
    return this.http.put<RoomResponse>(`${this.apiUrl}/${id}`, formData);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- AMENITIES METHODS ---
  getAllAmenities(): Observable<Amenity[]> {
    return this.http.get<Amenity[]>(`${this.apiUrl}/amenities`);
  }

  createAmenity(data: Amenity): Observable<Amenity> {
    return this.http.post<Amenity>(`${this.apiUrl}/amenities`, data);
  }
  updateRoomStatus(roomId: number, status: string): Observable<any> {
  // Đảm bảo đường dẫn API khớp với Backend của bạn
  // Ví dụ: /api/rooms/1/status?status=OCCUPIED
  return this.http.put(`${this.apiUrl}/${roomId}/status`, null, {
    params: { status: status }
  });
}
}