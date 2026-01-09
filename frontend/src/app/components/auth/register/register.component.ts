import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData = {
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'TENANT' // Luôn là TENANT khi đăng ký
  };

  confirmPasswordValue = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Kiểm tra mật khẩu và mật khẩu xác nhận có khớp không
   */
  passwordsMatch(): boolean {
    if (!this.confirmPasswordValue) {
      return true; // Không hiển thị lỗi nếu chưa nhập confirm password
    }
    return this.registerData.password === this.confirmPasswordValue;
  }

  onRegister() {
    // Kiểm tra mật khẩu khớp
    if (!this.passwordsMatch()) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp!';
      return;
    }

    // Reset messages và bật loading
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        this.successMessage = 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...';
        this.isLoading = false;

        // Chuyển hướng sau 2 giây
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        this.isLoading = false;

        // Xử lý các loại lỗi cụ thể
        if (err.status === 409 || err.status === 400) {
          // Conflict - Username hoặc email đã tồn tại
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else if (err.error?.includes('username')) {
            this.errorMessage = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
          } else if (err.error?.includes('email')) {
            this.errorMessage = 'Email đã được sử dụng. Vui lòng dùng email khác.';
          } else {
            this.errorMessage = 'Tên đăng nhập hoặc email đã tồn tại!';
          }
        } else if (err.status === 403) {
          this.errorMessage = 'Tài khoản hoặc email đã tồn tại. Vui lòng sử dụng thông tin khác.';
        } else if (err.status === 422) {
          // Validation error
          this.errorMessage = 'Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (err.status === 0) {
          this.errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Đăng ký thất bại! Vui lòng thử lại sau.';
        }

        console.error('Register error:', err);
      }
    });
  }
}