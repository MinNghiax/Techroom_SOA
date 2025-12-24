import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-buildings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-buildings.component.html',
  styleUrls: ['./manage-buildings.component.scss']
})
export class ManageBuildingsComponent implements OnInit {
  // Dữ liệu mẫu (sau này bạn sẽ gọi từ BuildingService)
  buildings: any[] = [
    { id: 1, name: 'Techroom Landmark', address: 'Quận 1, TP.HCM', totalRooms: 20, activeRooms: 18, status: 'OPEN' },
    { id: 2, name: 'Techroom Riverside', address: 'Quận 7, TP.HCM', totalRooms: 15, activeRooms: 5, status: 'OPEN' }
  ];

  isLoading = false;

  constructor() {}

  ngOnInit(): void {
    // Gọi API lấy danh sách tòa nhà ở đây
  }

  onEdit(id: number) {
    console.log('Chỉnh sửa tòa nhà:', id);
  }
}