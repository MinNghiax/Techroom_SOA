import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/register`, userData);
  }

  login(credentials: any) {
  return this.http.post<any>(`${this.authUrl}/login`, credentials).pipe(
    tap(res => {
      // Lưu các thông tin cũ của bạn
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('username', res.username);
      localStorage.setItem('userId', res.userId);

      // BỔ SUNG DÒNG NÀY: Lưu họ tên thật vào localStorage
      // res.fullName phải khớp chính xác với tên trường Backend trả về
      if (res.fullName) {
        localStorage.setItem('fullName', res.fullName);
      } else {
        console.warn('Backend không trả về trường fullName!');
      }

      // Logic xử lý role giữ nguyên
      let roleName = res.role === 0 ? 'ADMIN' : (res.role === 1 ? 'LANDLORD' : 'TENANT');
      localStorage.setItem('userRole', roleName);
    })
  );
}

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getRole(): string | null {
    return localStorage.getItem('userRole'); // Ví dụ: 'ADMIN', 'LANDLORD', 'TENANT'
  }

  logout() {
    localStorage.clear();
  }
}