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

  // Edit Modal
  isEditModalOpen = false;
  selectedUser: User | null = null;
  editData: UserUpdate = {};

  // Create Modal
  isCreateModalOpen = false;
  newUser: any = {
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'TENANT' // Mặc định
  };

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
        this.onSearch();
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers = this.users;
      return;
    }
    this.filteredUsers = this.users.filter(u => 
      u.fullName?.toLowerCase().includes(term) || 
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  }

  // --- THÊM MỚI ---
  openCreateModal(): void {
    this.newUser = { role: 'TENANT', username: '', password: '', fullName: '', email: '', phone: '' };
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  onCreateUser(): void {
    if (!this.newUser.username || !this.newUser.password || !this.newUser.email || !this.newUser.fullName) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }

    this.userService.createUser(this.newUser).subscribe({
      next: (createdUser) => {
        alert('Tạo thành viên mới thành công!');
        this.users.unshift(createdUser);
        this.onSearch();
        this.closeCreateModal();
      },
      error: (err) => {
        console.error('Lỗi tạo user:', err);
        alert('Lỗi: ' + (err.error?.message || 'Không thể tạo người dùng.'));
      }
    });
  }

  // --- SỬA ---
  openEditModal(user: User): void {
    this.selectedUser = user;
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
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) this.users[index] = updatedUser;
          this.onSearch();
          alert('Cập nhật thành công!');
          this.closeEditModal();
        },
        error: (err) => alert('Lỗi cập nhật: ' + (err.error?.message || err.message))
      });
    }
  }

  toggleUserStatus(user: User): void {
    const newStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    if (confirm(`Xác nhận thay đổi trạng thái của ${user.username}?`)) {
      this.userService.updateUser(user.id, { status: newStatus }).subscribe({
        next: (updated) => {
          user.status = updated.status;
          alert('Đã thay đổi trạng thái!');
        },
        error: (err) => alert('Lỗi: ' + err.message)
      });
    }
  }

  onDelete(id: number): void {
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.onSearch();
          alert('Đã xóa thành công!');
        },
        error: (err) => alert('Lỗi xóa: ' + err.message)
      });
    }
  }

  getRoleLabel(role: any): string {
    const roles: { [key: string]: string } = { 
      'ADMIN': 'QUẢN TRỊ', 'LANDLORD': 'CHỦ NHÀ', 'TENANT': 'NGƯỜI THUÊ' 
    };
    const roleNum: { [key: number]: string } = { 0: 'QUẢN TRỊ', 1: 'CHỦ NHÀ', 2: 'NGƯỜI THUÊ' };
    return typeof role === 'number' ? (roleNum[role] || 'USER') : (roles[role] || role);
  }
}