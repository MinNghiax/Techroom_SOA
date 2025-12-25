import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { RoomResponse } from '../../models/room.model';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit {
  rooms: RoomResponse[] = [];
  isLoading = true;
  readonly baseUrl = 'http://localhost:8080'; // Cần khớp với Backend của bạn

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách phòng:', err);
        this.isLoading = false;
      }
    });
  }

  // Hàm bổ trợ để hiển thị ảnh đầy đủ đường dẫn
  getImgUrl(url: string): string {
    if (!url) return 'assets/images/no-image.jpg';
    return url.startsWith('http') ? url : `${this.baseUrl}${url}`;
  }
}