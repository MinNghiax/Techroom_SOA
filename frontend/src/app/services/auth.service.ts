import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // Thêm phương thức này để sửa lỗi ts(2339)
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/register`, userData);
  }

  login(credentials: any) {
  return this.http.post<any>(`${this.authUrl}/login`, credentials).pipe(
    tap(res => {
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('username', res.username);
      localStorage.setItem('userId', res.userId);

      // Chuyển đổi ID role số sang chuỗi để dễ đọc code
      let roleName = '';
      if (res.role === 0) roleName = 'ADMIN';
      else if (res.role === 1) roleName = 'LANDLORD';
      else roleName = 'TENANT'; // Mặc định là 2
      
      localStorage.setItem('userRole', roleName);
    })
  );
}

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  logout() {
    localStorage.clear();
  }
}