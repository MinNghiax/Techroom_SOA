import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { BuildingService } from '../../services/building.service';
import { RoomResponse } from '../../models/room.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredRooms: RoomResponse[] = [];
  featuredBuildings: any[] = [];
  readonly baseUrl = 'http://localhost:8080';

  constructor(
    private roomService: RoomService,
    private buildingService: BuildingService
  ) {}

  ngOnInit(): void {
    // Lấy danh sách phòng và hiển thị 4 phòng mới nhất
    this.roomService.getRooms().subscribe(rooms => {
      this.featuredRooms = rooms.slice(0, 4);
    });

    // Lấy danh sách tòa nhà (Nếu service có hàm getBuildings)
    this.buildingService.getBuildings().subscribe(buildings => {
      this.featuredBuildings = buildings.slice(0, 2);
    });
  }

  getImgUrl(url: string): string {
    if (!url) return 'assets/images/no-image.jpg';
    return url.startsWith('http') ? url : `${this.baseUrl}${url}`;
  }
}