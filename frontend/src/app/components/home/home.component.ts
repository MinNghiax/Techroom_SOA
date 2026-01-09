import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { RoomResponse } from '../../models/room.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  allRooms: RoomResponse[] = [];      // Kho dữ liệu gốc từ Backend
  featuredRooms: RoomResponse[] = []; // Dữ liệu đã lọc để hiển thị lên HTML
  locations: string[] = [];           // Danh sách khu vực lấy từ dữ liệu thật
  readonly baseUrl = 'http://localhost:8080';

  searchCriteria = {
    location: '',
    priceRange: '',
    areaRange: ''
  };

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.allRooms = rooms;
        this.featuredRooms = rooms.slice(0, 4); // Mặc định hiện 4 phòng mới nhất
        this.extractLocations(rooms);
      },
      error: (err) => console.error('Lỗi kết nối API:', err)
    });
  }

  extractLocations(rooms: RoomResponse[]): void {
    // Lấy danh sách buildingName không trùng lặp từ dữ liệu phòng
    const uniqueLocations = [...new Set(rooms.map(r => r.buildingName))];
    this.locations = uniqueLocations.sort();
  }

  // LOGIC SO SÁNH CHÍNH
  onSearch(): void {
    this.featuredRooms = this.allRooms.filter(room => {
      // 1. So sánh Khu vực
      const matchLoc = !this.searchCriteria.location || room.buildingName === this.searchCriteria.location;

      // 2. So sánh Giá (Ví dụ: "2000000-5000000" -> min: 2tr, max: 5tr)
      let matchPrice = true;
      if (this.searchCriteria.priceRange) {
        const [min, max] = this.searchCriteria.priceRange.split('-').map(Number);
        matchPrice = room.price >= min && room.price <= max;
      }

      // 3. So sánh Diện tích
      let matchArea = true;
      if (this.searchCriteria.areaRange) {
        const [minA, maxA] = this.searchCriteria.areaRange.split('-').map(Number);
        matchArea = room.area >= minA && room.area <= maxA;
      }

      return matchLoc && matchPrice && matchArea;
    });
  }

  getImgUrl(url: string): string {
    if (!url) return 'assets/images/no-image.jpg';
    return url.startsWith('http') ? url : `${this.baseUrl}${url}`;
  }
}