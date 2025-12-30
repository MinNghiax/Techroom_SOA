import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../services/booking.service'; // Kiểm tra đường dẫn này

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  isLoading = true;
  selectedContract: any = null;
  showDetailModal: boolean = false;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadMyContracts();
  }

  loadMyContracts(): void {
    this.bookingService.getMyContracts().subscribe({
      next: (res) => {
        if (res.success) {
          this.bookings = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải hợp đồng:', err);
        this.isLoading = false;
      }
    });
  }

  // Hàm helper để hiển thị màu sắc cho trạng thái
  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'badge-success';
      case 'PENDING': return 'badge-warning';
      case 'REJECTED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
  viewDetail(contract: any) {
    this.selectedContract = contract;
    this.showDetailModal = true;
  }

  // 3. Hàm đóng Modal
  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedContract = null;
  }

}