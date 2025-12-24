import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 1. Import RouterModule ở đây
import { BuildingService } from '../../services/building.service';

@Component({
  selector: 'app-building-list',
  standalone: true,
  // 2. Thêm RouterModule vào mảng imports bên dưới
  imports: [CommonModule, RouterModule], 
  templateUrl: './building-list.component.html',
  styleUrls: ['./building-list.component.scss']
})
export class BuildingListComponent implements OnInit {
  buildings: any[] = [];
  isLoading = true;

  constructor(private buildingService: BuildingService) {}

  ngOnInit(): void {
    this.loadBuildings();
  }

  loadBuildings(): void {
    this.buildingService.getBuildings().subscribe({
      next: (data) => {
        this.buildings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải danh sách tòa nhà:', err);
        this.isLoading = false;
      }
    });
  }
}