import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuildingService } from '../../../services/building.service';
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-manage-buildings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-buildings.component.html',
  styleUrls: ['./manage-buildings.component.scss']
})
export class ManageBuildingsComponent implements OnInit {
  // Dữ liệu hiển thị
  buildings: any[] = [];
  provinces: any[] = [];
  districts: any[] = [];
  
  // Trạng thái Modal
  isModalOpen = false;
  isEditMode = false;
  selectedBuildingId: number | null = null;

  // Dữ liệu Form (Khớp với BuildingRequest DTO ở Backend)
  buildingForm = {
    name: '',
    address: '',
    description: '',
    provinceCode: null as number | null,
    districtCode: null as number | null
  };

  constructor(
    private buildingService: BuildingService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
    this.loadProvinces();
  }

  /**
   * Tải danh sách tòa nhà theo chủ trọ hiện tại
   */
  loadBuildings() {
    const userIdStr = localStorage.getItem('userId');
    if (userIdStr && userIdStr !== 'undefined' && userIdStr !== 'null') {
      const landlordId = Number(userIdStr);
      this.buildingService.getBuildingsByLandlord(landlordId).subscribe({
        next: (data) => this.buildings = data,
        error: (err) => console.error('Lỗi tải danh sách tòa nhà:', err)
      });
    }
  }

  /**
   * Tải danh sách Tỉnh/Thành từ database
   */
  loadProvinces() {
    this.locationService.getProvinces().subscribe(data => this.provinces = data);
  }

  /**
   * Xử lý khi thay đổi Tỉnh/Thành -> Tải Quận/Huyện tương ứng
   */
  onProvinceChange() {
    this.districts = [];
    this.buildingForm.districtCode = null;
    if (this.buildingForm.provinceCode) {
      this.locationService.getDistricts(this.buildingForm.provinceCode).subscribe(data => {
        this.districts = data;
      });
    }
  }

  /**
   * Mở modal chế độ Thêm mới
   */
  openAddModal() {
    this.isEditMode = false;
    this.selectedBuildingId = null;
    this.buildingForm = { name: '', address: '', description: '', provinceCode: null, districtCode: null };
    this.districts = [];
    this.isModalOpen = true;
  }

  /**
   * Mở modal chế độ Chỉnh sửa và đổ dữ liệu cũ vào form
   */
  openEditModal(b: any) {
    this.isEditMode = true;
    this.selectedBuildingId = b.id;
    this.buildingForm = {
      name: b.name,
      address: b.address,
      description: b.description,
      provinceCode: b.provinceCode,
      districtCode: b.districtCode
    };
    
    // Tải danh sách huyện của tỉnh cũ để dropdown hiển thị đúng tên huyện
    this.locationService.getDistricts(b.provinceCode).subscribe(data => {
      this.districts = data;
      this.isModalOpen = true;
    });
  }

  /**
   * Lưu dữ liệu (Phân biệt Create và Update)
   */
  saveBuilding() {
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr || userIdStr === 'undefined' || userIdStr === 'null') {
      alert('Lỗi: Không tìm thấy ID chủ trọ. Vui lòng đăng nhập lại!');
      return;
    }

    const landlordId = parseInt(userIdStr, 10);

    // Kiểm tra tính hợp lệ đơn giản
    if (!this.buildingForm.provinceCode || !this.buildingForm.districtCode) {
      alert('Vui lòng chọn đầy đủ Tỉnh/Thành và Quận/Huyện!');
      return;
    }

    const payload = {
      landlordId: landlordId,
      name: this.buildingForm.name,
      address: this.buildingForm.address,
      description: this.buildingForm.description,
      province: { code: Number(this.buildingForm.provinceCode) },
      district: { code: Number(this.buildingForm.districtCode) }
    };

    if (this.isEditMode && this.selectedBuildingId) {
      // GỌI UPDATE (PUT) - Tránh việc tạo mới dữ liệu khi đang sửa
      this.buildingService.updateBuilding(this.selectedBuildingId, payload).subscribe({
        next: () => {
          alert('Cập nhật tòa nhà thành công!');
          this.onSaveSuccess();
        },
        error: (err) => alert('Lỗi khi cập nhật tòa nhà!')
      });
    } else {
      // GỌI CREATE (POST)
      this.buildingService.createBuilding(payload).subscribe({
        next: () => {
          alert('Thêm tòa nhà mới thành công!');
          this.onSaveSuccess();
        },
        error: (err) => alert('Lỗi khi thêm tòa nhà mới!')
      });
    }
  }

  /**
   * Xóa tòa nhà và các phòng liên quan
   */
  deleteBuilding(id: number) {
    const confirmDelete = confirm(
      'CẢNH BÁO: Xóa tòa nhà sẽ xóa tất cả danh sách phòng thuộc tòa nhà này. Bạn có chắc chắn muốn xóa không?'
    );
    
    if (confirmDelete) {
      this.buildingService.deleteBuilding(id).subscribe({
        next: () => {
          alert('Đã xóa tòa nhà và các phòng liên quan thành công!');
          this.loadBuildings(); // Tải lại danh sách sau khi xóa
        },
        error: (err) => {
          console.error('Lỗi khi xóa tòa nhà:', err);
          alert('Không thể xóa tòa nhà này. Vui lòng kiểm tra lại!');
        }
      });
    }
  }

  /**
   * Hỗ trợ sau khi lưu thành công
   */
  onSaveSuccess() {
    this.loadBuildings();
    this.isModalOpen = false;
  }
}