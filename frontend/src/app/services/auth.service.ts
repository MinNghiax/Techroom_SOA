import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface AuthResponse {
  accessToken: string;
  username: string;
  fullName?: string;
  role: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Đăng ký tài khoản mới
   */
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /**
   * Đăng nhập
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return new Observable<AuthResponse>((observer) => {
      this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).subscribe({
        next: (res) => {
          // Lưu accessToken và role vào localStorage
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('role', res.role); 
          localStorage.setItem('username', res.username);
          if (res.fullName) localStorage.setItem('fullName', res.fullName);
          observer.next(res);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  /**
   * Đăng xuất
   */
  logout(): void {
    const token = localStorage.getItem('accessToken');
    
    // Gọi API logout (optional - vì JWT stateless)
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      
      this.http.post(`${this.apiUrl}/logout`, {}, { headers }).subscribe({
        next: () => console.log('Logged out successfully'),
        error: () => console.log('Logout API failed, clearing local data anyway')
      });
    }

    // Xóa tất cả thông tin đăng nhập
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');

    // Chuyển về trang login
    this.router.navigate(['/login']);
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Lấy role của user hiện tại
   */
  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  /**
   * Lấy username của user hiện tại
   */
  getUsername(): string | null {
    return localStorage.getItem('username');
  }
}