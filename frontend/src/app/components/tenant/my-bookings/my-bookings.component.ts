// my-bookings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../services/booking.service';
import { RoomService } from '../../../services/room.service'; 

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  rooms: any[] = []; 
  isLoading = true;
  selectedContract: any = null;
  showDetailModal: boolean = false;

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService // 3. Inject RoomService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  // 4. Load cả danh sách phòng và hợp đồng
  loadInitialData(): void {
  this.isLoading = true;
  
  // 1. Đổi getAllRooms() thành getRooms() theo gợi ý của trình biên dịch
  // 2. Thêm kiểu dữ line cho roomRes và err để tránh lỗi "implicitly has any type"
  this.roomService.getRooms().subscribe({ 
    next: (roomRes: any) => { 
      this.rooms = roomRes;
      this.loadMyContracts();
    },
    error: (err: any) => {
      console.error('Lỗi tải phòng:', err);
      this.loadMyContracts();
    }
  });
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

  // 5. Cập nhật hàm xem chi tiết để mapping buildingName/roomName
  viewDetail(contract: any) {
  // Tìm phòng dựa trên roomId của hợp đồng
  const roomInfo = this.rooms.find((r: any) => r.id === contract.roomId);
  
  this.selectedContract = {
    ...contract,
    roomName: roomInfo ? roomInfo.name : 'N/A',
    buildingName: roomInfo ? roomInfo.buildingName : 'N/A'
  };
  this.showDetailModal = true;
}

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': case 'ACTIVE': return 'badge-success';
      case 'PENDING': return 'badge-warning';
      case 'REJECTED': case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedContract = null;
  }
}