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
    // Giả lập role nếu chưa có để debug
    if (!localStorage.getItem('role')) {
      localStorage.setItem('role', 'LANDLORD');
      localStorage.setItem('userId', '8');
    }
    this.userRole = localStorage.getItem('role') || '';
    this.loadContracts();
  }

  loadContracts() {
    this.isLoading = true;
    this.bookingService.getLandlordBookings().subscribe({
      next: (res: ApiResponse<Contract[]>) => {
        this.contracts = res.data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Lỗi tải dữ liệu:', err);
        this.isLoading = false;
      }
    });
  }

  approve(id: number) {
    if (confirm('Xác nhận duyệt hợp đồng này?')) {
      this.bookingService.approve(id).subscribe({
        next: (res) => {
          alert('Đã duyệt thành công!');
          this.loadContracts();
        },
        error: (err: any) => alert('Lỗi: ' + (err.error?.message || 'Không thể duyệt'))
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
        error: (err: any) => alert('Lỗi khi từ chối.')
      });
    }
  }

  // Chấm dứt hợp đồng (Chuyển sang trạng thái CANCELLED)
  terminateContract(id: number) {
    if (confirm('Bạn có chắc muốn CHẤM DỨT hợp đồng này? Trạng thái sẽ chuyển thành CANCELLED.')) {
      this.bookingService.terminate(id).subscribe({
        next: () => {
          alert('Đã chấm dứt hợp đồng thành công.');
          this.closeDetailModal();
          this.loadContracts();
        },
        error: (err: any) => alert('Lỗi: ' + (err.error?.message || 'Không thể chấm dứt'))
      });
    }
  }

  // Xóa hợp đồng vĩnh viễn
  deleteContract(id: number) {
    if (confirm('Bạn có chắc chắn muốn XÓA vĩnh viễn hợp đồng này khỏi hệ thống?')) {
      this.bookingService.deleteContract(id).subscribe({
        next: () => {
          alert('Đã xóa dữ liệu hợp đồng thành công.');
          this.loadContracts();
        },
        error: (err: any) => alert('Lỗi: ' + (err.error?.message || 'Không thể xóa'))
      });
    }
  }

  viewDetail(id: number) {
    this.selectedContract = this.contracts.find(c => c.id === id);
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedContract = null;
  }
}