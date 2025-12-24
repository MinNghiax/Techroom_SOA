import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User, UserUpdate } from '../../../models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;

  // Logic cho Modal sửa
  isEditModalOpen = false;
  selectedUser: User | null = null;
  editData: UserUpdate = {};

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(u => 
      u.fullName?.toLowerCase().includes(term) || 
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  }

  // --- CHỨC NĂNG SỬA ---
  openEditModal(user: User): void {
    this.selectedUser = user;
    // Sao chép dữ liệu sang object tạm để không ảnh hưởng bảng khi chưa lưu
    this.editData = {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedUser = null;
    this.editData = {};
  }

  onSaveUpdate(): void {
    if (this.selectedUser) {
      this.userService.updateUser(this.selectedUser.id, this.editData).subscribe({
        next: (updatedUser) => {
          // Cập nhật lại dữ liệu trong danh sách cục bộ
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.onSearch();
          }
          alert('Cập nhật thông tin thành công!');
          this.closeEditModal();
        },
        error: () => alert('Lỗi: Không thể lưu thay đổi!')
      });
    }
  }

  toggleUserStatus(user: User): void {
    const newStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    const msg = newStatus === 'BANNED' ? 'KHÓA' : 'MỞ KHÓA';
    if (confirm(`Xác nhận ${msg} tài khoản @${user.username}?`)) {
      this.userService.updateUser(user.id, { status: newStatus }).subscribe({
        next: (updated) => user.status = updated.status,
        error: () => alert('Lỗi cập nhật trạng thái!')
      });
    }
  }

  onDelete(id: number): void {
    if (confirm('Bạn chắc chắn muốn xóa thành viên này?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.onSearch();
        },
        error: () => alert('Lỗi khi xóa người dùng!')
      });
    }
  }

  getRoleLabel(role: any): string {
    const roles: { [key: number]: string } = { 0: 'QUẢN TRỊ', 1: 'CHỦ NHÀ', 2: 'NGƯỜI THUÊ' };
    return typeof role === 'number' ? roles[role] : (role || 'THÀNH VIÊN');
  }
}