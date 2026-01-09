import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP Interceptor để xử lý lỗi authentication
 * Tự động logout và redirect về login nếu phát hiện tài khoản bị khóa
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      // Nếu backend trả về 403 và message là "Tài khoản đã bị khóa"
      if (error.status === 403) {
        const errorMessage = error.error?.message || '';
        
        // Check nếu message chứa từ khóa về tài khoản bị khóa
        if (errorMessage.includes('khóa') || errorMessage.toLowerCase().includes('banned')) {
          // Xóa tất cả thông tin đăng nhập
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('username');
          localStorage.removeItem('fullName');
          
          // Hiển thị thông báo
          alert('Tài khoản của bạn đã bị khóa bởi quản trị viên.');
          
          // Chuyển về trang login
          router.navigate(['/login']);
        }
      }

      // Throw error để component có thể xử lý tiếp
      return throwError(() => error);
    })
  );
};