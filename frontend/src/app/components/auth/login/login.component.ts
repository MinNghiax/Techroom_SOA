import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginData = {
    username: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        // Lưu thông tin vào localStorage
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('userRole', res.role);
        localStorage.setItem('username', res.username);
        
        // Lưu fullName nếu có
        if (res.fullName) {
          localStorage.setItem('fullName', res.fullName);
        }

        this.successMessage = 'Đăng nhập thành công! Đang chuyển hướng...';
        this.isLoading = false;

        // ✅ REDIRECT DỰA TRÊN ROLE
        setTimeout(() => {
          const role = res.role;
          
          if (role === 'ADMIN' || role === 0) {
            // Admin vào thẳng dashboard thống kê
            this.router.navigate(['/admin/statistics']);
          } else if (role === 'LANDLORD' || role === 1) {
            // Landlord vào quản lý phòng
            this.router.navigate(['/landlord/manage-rooms']);
          } else {
            // Tenant vào trang chủ
            this.router.navigate(['/']);
          }
        }, 1500);
      },
      error: (err: any) => {
        this.isLoading = false;
        
        // Xử lý các loại lỗi khác nhau
        if (err.status === 401) {
          this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác!';
        } else if (err.status === 403) {
          this.errorMessage = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.';
        } else if (err.status === 0) {
          this.errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        } else if (err.error?.message) {
          // Backend trả về message cụ thể (ví dụ: "Tài khoản đã bị khóa")
          this.errorMessage = err.error.message;
        } else if (err.error?.error) {
          // Format: { "error": "Tài khoản đã bị khóa" }
          this.errorMessage = err.error.error;
        } else {
          this.errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
        }

        console.error('Login error:', err);
      }
    });
  }
}