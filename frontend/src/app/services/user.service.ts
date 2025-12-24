import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserUpdate } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Đi qua Gateway để tận dụng Load Balancer và Auth Filter
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  // 1. Lấy danh sách (GET /api/users)
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // 2. Xem chi tiết (GET /api/users/{id})
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // 3. Cập nhật / Khóa (PUT /api/users/{id})
  updateUser(id: number, userData: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  // 4. Xóa (DELETE /api/users/{id})
  deleteUser(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}