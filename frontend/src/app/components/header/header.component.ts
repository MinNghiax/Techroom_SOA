import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // authService phải là public để template HTML có thể truy cập trực tiếp
  constructor(public authService: AuthService) {}

  /**
   * Lấy tên hiển thị của người dùng.
   * Ưu tiên: fullName > username > 'Người dùng'
   */
  getFullName(): string {
    const fullName = localStorage.getItem('fullName');
    const username = localStorage.getItem('username');

    // Kiểm tra tính hợp lệ của fullName (không null, không phải chuỗi "null", không rỗng)
    if (fullName && fullName !== 'null' && fullName.trim() !== '') {
      return fullName;
    }
    
    // Nếu không có fullName, trả về username hoặc mặc định
    return username || 'Người dùng';
  }

  onLogout() {
    this.authService.logout();
  }
}