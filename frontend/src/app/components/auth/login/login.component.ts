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
  // Đối tượng chứa thông tin đăng nhập khớp với LoginRequest của Backend
  loginData = {
    username: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        // Lưu thông tin từ AuthResponse vào máy khách
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('userRole', res.role);
        localStorage.setItem('username', res.username);
        // Chuyển hướng về trang chủ sau khi thành công
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng!';
        console.error('Login error:', err);
      }
    });
  }
}