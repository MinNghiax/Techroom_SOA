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
    role: 'TENANT'
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        this.successMessage = 'Đăng ký thành công!';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        this.isLoading = false;
        // Nếu Backend trả về JSON có trường message, hãy lấy nó ra
        this.errorMessage = err.error?.message || err.error || 'Đăng ký thất bại!';
        console.log('Chi tiết lỗi:', err); // Xem log ở F12 để biết cấu trúc object
      }
    });
  }
}