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
  // authService phải là public để HTML truy cập được
  constructor(public authService: AuthService) {}

  getFullName(): string {
  const fullName = localStorage.getItem('fullName');
  const username = localStorage.getItem('username');

  // Kiểm tra nếu fullName tồn tại và không phải chuỗi "null" hoặc rỗng
  if (fullName && fullName !== 'null' && fullName.trim() !== '') {
    return fullName;
  }
  
  // Nếu không có fullName thì mới dùng username
  return username || 'Người dùng';
}

  onLogout() {
    this.authService.logout();
  }
}