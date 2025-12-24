import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth Interceptor: Tự động gắn Token và Header định danh cho mọi request HTTP.
 * Xử lý ánh xạ vai trò từ tên (String) sang mã số (Number) cho Backend.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('accessToken');

  // Kiểm tra token tồn tại và không phải là chuỗi "null"/"undefined" do localStorage trả về
  if (token && token !== 'null' && token !== 'undefined') {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Nếu không có token (đang đăng ký/đăng nhập), gửi request gốc đi mà không kèm Header Auth
  return next(req);
};