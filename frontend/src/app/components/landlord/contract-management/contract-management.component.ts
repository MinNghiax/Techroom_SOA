import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../services/booking.service'; 
import { Contract, ApiResponse } from '../../../models/booking.model';
import { RoomService } from '../../../services/room.service';
import { RoomRequest, RoomResponse } from '../../../models/room.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-contract-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-management.component.html',
  styleUrl: './contract-management.component.scss'
})
export class ContractManagementComponent implements OnInit {
  rooms: RoomResponse[] = [];
  selectedContract: any = null;
  showDetailModal: boolean = false;
  contracts: Contract[] = [];
  isLoading: boolean = false;
  userRole: string = '';

  constructor(private bookingService: BookingService, private roomService: RoomService) {}

  roomForm: RoomRequest = {
      buildingId: 0, name: '', price: 0, area: 0,
      status: 'AVAILABLE', description: '', amenityIds: [], imageUrls: []
    };
    
  ngOnInit(): void {
    // Giả lập role nếu chưa có để debug
    if (!localStorage.getItem('role')) {
      localStorage.setItem('role', 'LANDLORD');
      localStorage.setItem('userId', '8');
    }
    this.userRole = localStorage.getItem('role') || '';
    this.loadContracts();
  }

  loadRooms() {
    this.isLoading = true;
    this.roomService.getRoomsByLandlord().subscribe({
      next: (data) => { this.rooms = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
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

  // Duyệt hợp đồng 
  approve(id: number) {
  const contract = this.contracts.find(c => c.id === id);
  if (!contract) return;

  if (confirm('Xác nhận duyệt hợp đồng này?')) {
    this.bookingService.approve(id).subscribe({
      next: (res) => {
        // Cập nhật trạng thái phòng
        this.roomService.updateRoomStatus(contract.roomId, 'OCCUPIED').subscribe({
          next: () => {
            alert('Đã duyệt hợp đồng và cập nhật trạng thái phòng thành công!');
            this.loadContracts();
          },
          error: (err: any) => { // Thêm kiểu dữ liệu :any ở đây
            console.error('Lỗi cập nhật trạng thái phòng:', err);
            alert('Hợp đồng đã duyệt nhưng không thể cập nhật trạng thái phòng.');
            this.loadContracts();
          }
        });
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

  // Chấm dứt hợp đồng 
  terminateContract(id: number) {
  const contract = this.contracts.find(c => c.id === id);
  if (!contract) return;

  if (confirm('Bạn có chắc muốn CHẤM DỨT hợp đồng này? ')) {
    this.bookingService.terminate(id).subscribe({
      next: () => {
        // Trả trạng thái phòng về AVAILABLE
        this.roomService.updateRoomStatus(contract.roomId, 'AVAILABLE').subscribe({
          next: () => {
            alert('Đã chấm dứt hợp đồng.');
            this.closeDetailModal();
            this.loadContracts();
          },
          error: (err: any) => { // Thêm kiểu dữ liệu :any ở đây
            console.error('Lỗi trả trạng thái phòng:', err);
            this.loadContracts();
          }
        });
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