import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../services/room.service';
import { RoomResponse, RoomRequest } from '../../../models/room.model';

@Component({
  selector: 'app-manage-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-rooms.component.html',
  styleUrls: ['./manage-rooms.component.scss']
})
export class ManageRoomsComponent implements OnInit {
  rooms: RoomResponse[] = [];
  isLoading = true;
  
  // Modal State
  isModalOpen = false;
  isEditMode = false;
  selectedRoomId: number | null = null;

  // Form Data
  roomForm: RoomRequest = {
    buildingId: 0,
    name: '',
    price: 0,
    area: 0,
    status: 'AVAILABLE',
    description: '',
    amenityIds: []
  };

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms() {
    this.isLoading = true;
    this.roomService.getRoomsByLandlord().subscribe({
      next: (data) => {
        this.rooms = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.roomForm = { buildingId: 1, name: '', price: 0, area: 0, status: 'AVAILABLE', description: '', amenityIds: [] };
    this.isModalOpen = true;
  }

  openEditModal(room: RoomResponse) {
    this.isEditMode = true;
    this.selectedRoomId = room.id;
    // Map từ Response sang Request
    this.roomForm = {
      buildingId: 1, // Giả định lấy từ buildingName hoặc API khác
      name: room.name,
      price: room.price,
      area: room.area,
      status: room.status,
      description: room.description, 
      amenityIds: []
    };
    this.isModalOpen = true;
  }

  saveRoom() {
    if (this.isEditMode && this.selectedRoomId) {
      this.roomService.updateRoom(this.selectedRoomId, this.roomForm).subscribe(() => {
        this.loadRooms();
        this.isModalOpen = false;
      });
    } else {
      this.roomService.createRoom(this.roomForm).subscribe(() => {
        this.loadRooms();
        this.isModalOpen = false;
      });
    }
  }

  deleteRoom(id: number) {
    if (confirm('Xác nhận xóa vĩnh viễn phòng này?')) {
      this.roomService.deleteRoom(id).subscribe(() => this.loadRooms());
    }
  }

  getStatusLabel(status: string): string {
    const map: any = { 'AVAILABLE': 'Còn trống', 'OCCUPIED': 'Đã thuê', 'REPAIRING': 'Đang sửa' };
    return map[status] || status;
  }
}