import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(public authService: AuthService, private router: Router) {}

  // Lấy tên người dùng từ localStorage để hiển thị chào mừng
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  // Lấy vai trò để hiển thị menu phù hợp (Admin/Landlord/Tenant)
  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}