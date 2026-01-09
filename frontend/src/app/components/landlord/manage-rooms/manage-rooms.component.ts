import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../services/room.service';
import { BuildingService } from '../../../services/building.service';
import { BookingService } from '../../../services/booking.service';
import { RoomResponse, RoomRequest, Amenity } from '../../../models/room.model';
import { Contract } from '../../../models/booking.model';

@Component({
  selector: 'app-manage-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-rooms.component.html',
  styleUrls: ['./manage-rooms.component.scss']
})
export class ManageRoomsComponent implements OnInit {
  rooms: RoomResponse[] = [];
  buildings: any[] = [];
  contracts: Contract[] = [];
  allAmenities: Amenity[] = [];
  isLoading = true;
  isModalOpen = false;
  isEditMode = false;
  selectedRoomId: number | null = null;
  currentStatus: string = '';
  hasActiveTenant: boolean = false;

  selectedFiles: File[] = [];
  imagePreviews: any[] = [];
  readonly baseUrl = 'http://localhost:8080';

  roomForm: RoomRequest = {
    buildingId: 0, name: '', price: 0, area: 0,
    status: 'AVAILABLE', description: '', amenityIds: [], imageUrls: []
  };

  constructor(private roomService: RoomService, private buildingService: BuildingService, private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBuildings();
    this.loadData();
    this.loadAmenities();
  }

  loadBuildings() {
    this.buildingService.getBuildingsByLandlord().subscribe({
      next: (data) => {
        this.buildings = data;
        // Tự động chọn tòa nhà đầu tiên nếu đang thêm mới
        if (!this.isEditMode && this.buildings.length > 0) {
          this.roomForm.buildingId = this.buildings[0].id;
        }
      },
      error: (err) => console.error('Lỗi tải danh sách tòa nhà:', err)
    });
  }

  loadRooms() {
    this.isLoading = true;
    this.roomService.getRoomsByLandlord().subscribe({
      next: (data) => { this.rooms = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  loadData() {
    this.isLoading = true;

    // Bước 1: Lấy danh sách phòng
    this.roomService.getRoomsByLandlord().subscribe({
      next: (roomData) => {
        this.rooms = roomData;

        // Bước 2: Dùng hàm CÓ SẴN của bạn để lấy hợp đồng
        // Hàm này tự lấy X-User-Id từ headers nên không cần truyền landlordId vào
        this.bookingService.getLandlordBookings().subscribe({
          next: (res) => {
            // Kiểm tra success và gán data (vì Backend trả về ApiResponse)
            if (res.success) {
              this.contracts = res.data;
              this.mergeTenantNames(); // Tiến hành so khớp tên khách
            }
            this.isLoading = false;
          },
          error: () => this.isLoading = false
        });
      },
      error: () => this.isLoading = false
    });
  }

  loadAmenities() {
    this.roomService.getAllAmenities().subscribe(data => this.allAmenities = data);
  }

  toggleAmenity(amenityId: number) {
    if (!this.roomForm.amenityIds) this.roomForm.amenityIds = [];
    const index = this.roomForm.amenityIds.indexOf(amenityId);
    if (index > -1) {
      this.roomForm.amenityIds.splice(index, 1);
    } else {
      this.roomForm.amenityIds.push(amenityId);
    }
  }

  addNewAmenity() {
    const name = prompt('Nhập tên tiện ích mới:');
    if (name && name.trim()) {
      this.roomService.createAmenity({ name: name.trim() }).subscribe(res => {
        this.allAmenities.push(res);
        if (res.id) {
          if (!this.roomForm.amenityIds) this.roomForm.amenityIds = [];
          this.roomForm.amenityIds.push(res.id);
        }
      });
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number, isNew: boolean) {
    this.imagePreviews.splice(index, 1);
    if (isNew) this.selectedFiles.splice(index, 1);
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedRoomId = null;
    this.selectedFiles = [];
    this.imagePreviews = [];
    const defaultId = this.buildings.length > 0 ? this.buildings[0].id : 0;
    this.roomForm = { 
      buildingId: defaultId, name: '', price: 0, area: 0, 
      status: 'AVAILABLE', description: '', amenityIds: [], imageUrls: [] 
    };
    this.isModalOpen = true;
  }

  openEditModal(room: RoomResponse) {
    this.isEditMode = true;
    this.selectedRoomId = room.id;
    this.currentStatus = room.status;
    this.hasActiveTenant = room.tenantName !== '---';
    this.selectedFiles = [];
    this.imagePreviews = room.imageUrls ? room.imageUrls.map(url => url.startsWith('http') ? url : `${this.baseUrl}${url}`) : [];
    
    // FIX: Map ID từ danh sách object amenities trả về từ Backend
    const currentAmenityIds = room.amenities ? room.amenities.map((a: any) => a.id) : [];

    this.roomForm = {
      buildingId: room.buildingId,
      name: room.name,
      price: room.price,
      area: room.area,
      status: room.status,
      description: room.description || '',
      amenityIds: currentAmenityIds,
      imageUrls: room.imageUrls || []
    };
    this.isModalOpen = true;
  }

  saveRoom() {
    if (this.roomForm.status === 'AVAILABLE' && this.hasActiveTenant) {
      alert('Phòng này đang có khách thuê (hợp đồng còn hiệu lực). Bạn không thể chuyển trạng thái thành "Còn trống". Hãy chấm dứt hợp đồng trước!');
      return;
    }
    // Validate phía Frontend trước khi gửi
    if (this.isEditMode && this.currentStatus === 'OCCUPIED' && this.roomForm.status === 'AVAILABLE') {
      alert('Phòng đang thuê không thể chuyển thành Trống. Vui lòng chuyển sang Đang sửa chữa!');
      return;
    }

    if (this.isEditMode && this.selectedRoomId) {
      this.roomService.updateRoom(this.selectedRoomId, this.roomForm, this.selectedFiles).subscribe({
        next: () => this.onSuccess(),
        error: (err) => alert(err.error?.message || 'Lỗi cập nhật phòng!') // Đã sửa dấu =>
      });
    } else {
      this.roomService.createRoom(this.roomForm, this.selectedFiles).subscribe({
        next: () => this.onSuccess(),
        error: (err) => alert('Lỗi tạo phòng mới!') // Đã sửa dấu =>
      });
    }
  }

  onSuccess() {
    this.loadData();
    this.isModalOpen = false;
    this.selectedFiles = [];
    this.imagePreviews = [];
    alert('Thành công!');
  }

  deleteRoom(id: number) {
    if (confirm('Xác nhận xóa phòng này?')) {
      this.roomService.deleteRoom(id).subscribe(() => this.loadRooms());
    }
  }

  getStatusLabel(s: string) {
    const m: any = { 'AVAILABLE': 'Còn trống', 'OCCUPIED': 'Đã thuê', 'REPAIRING': 'Đang sửa' };
    return m[s] || s;
  }

  trackByFn(index: any) { return index; }

  // Hàm so khớp: Tìm hợp đồng ACTIVE/APPROVED cho mỗi phòng
  mergeTenantNames() {
    this.rooms.forEach(room => {
      // Tìm hợp đồng khớp với roomId và đang ở trạng thái hiệu lực (APPROVED/ACTIVE)
      const match = this.contracts.find(c => 
        c.roomId === room.id && 
        (c.status === 'APPROVED' || c.status === 'ACTIVE')
      );
      
      // Gán tên khách từ trường fullName trong model Contract của bạn
      room.tenantName = match ? match.fullName : '---';
    });
  }
}