import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  isLoading = true;
  
  // Các biến lưu trữ con số thống kê
  stats = {
    total: 0,
    admins: 0,
    landlords: 0,
    tenants: 0,
    active: 0,
    banned: 0,
    activeRate: 0
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.calculateStats();
  }

  calculateStats(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.stats.total = users.length;
        
        // Đếm theo vai trò (Role)
        // Giả định: 0: ADMIN, 1: LANDLORD, 2: TENANT
        this.stats.admins = users.filter(u => Number(u.role) === 0 || u.role === 'ADMIN').length;
        this.stats.landlords = users.filter(u => Number(u.role) === 1 || u.role === 'LANDLORD').length;
        this.stats.tenants = users.filter(u => Number(u.role) === 2 || u.role === 'TENANT').length;
        
        // Đếm theo trạng thái
        this.stats.active = users.filter(u => u.status === 'ACTIVE').length;
        this.stats.banned = users.filter(u => u.status === 'BANNED').length;
        
        // Tính tỷ lệ hoạt động
        this.stats.activeRate = this.stats.total > 0 
          ? Math.round((this.stats.active / this.stats.total) * 100) 
          : 0;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi lấy dữ liệu thống kê:', err);
        this.isLoading = false;
      }
    });
  }
}