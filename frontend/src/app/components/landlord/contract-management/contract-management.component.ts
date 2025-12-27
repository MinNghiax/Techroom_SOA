import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../services/booking.service'; 
import { Contract, ApiResponse } from '../../../models/booking.model';

@Component({
  selector: 'app-contract-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-management.component.html',
  styleUrl: './contract-management.component.scss'
})
export class ContractManagementComponent implements OnInit {
  selectedContract: any = null;
  showDetailModal: boolean = false;
  contracts: Contract[] = [];
  isLoading: boolean = false;
  userRole: string = '';

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role') || '';
    this.loadContracts();
  }

  loadContracts() {
    if (!localStorage.getItem('role')) {
    localStorage.setItem('role', 'LANDLORD');
    localStorage.setItem('userId', '8'); // Dùng ID 8 từ log cũ của bạn
  }
  
  this.userRole = localStorage.getItem('role') || '';
  this.isLoading = true;
    this.bookingService.getLandlordBookings().subscribe({
      next: (res: ApiResponse<Contract[]>) => {
        this.contracts = res.data; // res.data là mảng Contract[] theo Interface ApiResponse
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu:', err);
        this.isLoading = false;
      }
    });
  }

  approve(id: number) {
    if (confirm('Xác nhận duyệt?')) {
      this.bookingService.approve(id).subscribe({
        next: (res) => {
          if (res.success) {
            alert('Đã duyệt thành công!');
            this.loadContracts();
          }
        },
        error: (err) => {
          // Xem log chi tiết lỗi 500 từ Business Logic của Java
          console.error('Lỗi từ Service Java:', err.error);
          alert('Lỗi: ' + (err.error?.message || 'Server không xử lý được yêu cầu này'));
        }
      });
    }
  }

  reject(id: number) {
    const reason = prompt('Nhập lý do từ chối:');
    if (reason !== null) {
      this.bookingService.reject(id, reason).subscribe({
        next: () => {
          alert('Đã từ chối yêu cầu.');
          this.loadContracts();
        },
        error: (err) => alert('Lỗi khi từ chối.')
      });
    }
  }

  terminateContract(id: number) {
    if (confirm('Bạn có chắc muốn chấm dứt hợp đồng này?')) {
      // Gọi service chấm dứt hợp đồng tại đây
      console.log('Chấm dứt hợp đồng ID:', id);
    }
  }
  viewDetail(id: number) {
    // Tìm hợp đồng trong danh sách dựa trên ID
    this.selectedContract = this.contracts.find(c => c.id === id);
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedContract = null;
  }
}