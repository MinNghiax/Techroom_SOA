import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { BuildingService } from '../../services/building.service';
import { RoomRequest, RoomResponse } from '../../models/room.model';

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

  constructor(
    private roomService: RoomService,
    private buildingService: BuildingService
  ) {}

  ngOnInit(): void {
    // Lấy danh sách phòng và chỉ hiển thị 3 phòng tiêu biểu
    this.roomService.getRooms().subscribe(rooms => {
      this.featuredRooms = rooms.slice(0, 3);
    });

    // Lấy danh sách tòa nhà và hiển thị 2 tòa nhà đầu tiên
    this.buildingService.getBuildings().subscribe(buildings => {
      this.featuredBuildings = buildings.slice(0, 2);
    });
  }
}