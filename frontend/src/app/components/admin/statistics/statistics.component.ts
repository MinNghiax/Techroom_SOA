import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { forkJoin, Subscription } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { RoomService } from '../../../services/room.service';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading = true; // Mặc định là true để hiện loading spinner nếu có

  stats = {
    total: 0,
    landlords: 0,
    tenants: 0,
    admins: 0,
    totalRooms: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    occupancyRate: 0,
  };

  userGrowthChart: any;
  roomStatusChart: any;

  // Dữ liệu mặc định để vẽ chart rỗng trước khi có data
  chartData = {
    roomStatus: [0, 0, 0],
    userGrowth: new Array(12).fill(0),
  };

  private sub: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngAfterViewInit(): void {
    // Vẽ chart rỗng ngay khi view init xong (để giữ chỗ layout)
    // Dùng setTimeout để tránh lỗi ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.initCharts();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.userGrowthChart) this.userGrowthChart.destroy();
    if (this.roomStatusChart) this.roomStatusChart.destroy();
    this.sub.unsubscribe();
  }

  fetchData(): void {
    this.isLoading = true;

    const request = forkJoin({
      users: this.userService.getAllUsers(),
      rooms: this.roomService.getRooms(),
    });

    this.sub.add(
      request.subscribe({
        next: (res) => {
          this.processUserData(res.users);
          this.processRoomData(res.rooms);

          this.isLoading = false;

          // Quan trọng: Update chart sau khi có data VÀ sau khi view đã render
          setTimeout(() => {
            this.updateCharts();
          }, 100);
        },
        error: (err) => {
          console.error('Lỗi tải thống kê:', err);
          this.isLoading = false;
        },
      })
    );
  }

  // ... (Giữ nguyên processUserData và processRoomData của bạn) ...
  private processUserData(users: any[]): void {
    if (!users) return;
    this.stats.total = users.length;
    this.stats.admins = 0;
    this.stats.landlords = 0;
    this.stats.tenants = 0;
    this.stats.newUsersThisMonth = 0;
    this.chartData.userGrowth = new Array(12).fill(0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    users.forEach((u) => {
      const r = u.role;
      if (r === 'ADMIN' || r === 0) this.stats.admins++;
      else if (r === 'LANDLORD' || r === 1) this.stats.landlords++;
      else this.stats.tenants++;

      if (u.createdAt || u.created_at) {
        const d = new Date(u.createdAt || u.created_at);
        if (d.getFullYear() === currentYear) {
          this.chartData.userGrowth[d.getMonth()]++;
          if (d.getMonth() === currentMonth) this.stats.newUsersThisMonth++;
        }
      }
    });
  }

  private processRoomData(rooms: any[]): void {
    if (!rooms) return;
    this.stats.totalRooms = rooms.length;
    let occupied = 0,
      available = 0,
      repairing = 0;

    rooms.forEach((r) => {
      if (r.status === 'OCCUPIED') occupied++;
      else if (r.status === 'AVAILABLE') available++;
      else repairing++;
    });

    this.chartData.roomStatus = [occupied, available, repairing];
    this.stats.occupancyRate =
      this.stats.totalRooms > 0
        ? Math.round((occupied / this.stats.totalRooms) * 100)
        : 0;
  }

  initCharts() {
    // Hủy chart cũ nếu tồn tại (để tránh memory leak hoặc vẽ đè)
    if (this.userGrowthChart) {
      this.userGrowthChart.destroy();
      this.userGrowthChart = null;
    }
    if (this.roomStatusChart) {
      this.roomStatusChart.destroy();
      this.roomStatusChart = null;
    }

    this.createUserGrowthChart();
    this.createRoomStatusChart();
  }

  updateCharts() {
    // Nếu chart chưa được khởi tạo (do view init chậm hơn data), thì khởi tạo mới
    if (!this.userGrowthChart || !this.roomStatusChart) {
      this.initCharts();
      return; // initCharts đã dùng data mới nhất rồi
    }

    // Cập nhật data cho Chart Line
    this.userGrowthChart.data.datasets[0].data = this.chartData.userGrowth;
    this.userGrowthChart.update();

    // Cập nhật data cho Chart Doughnut
    this.roomStatusChart.data.datasets[0].data = this.chartData.roomStatus;
    this.roomStatusChart.update();
  }

  createUserGrowthChart(): void {
    const ctx = document.getElementById('userGrowthChart') as HTMLCanvasElement;
    if (!ctx) return; // Nếu không tìm thấy canvas thì thoát ngay

    this.userGrowthChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [
          'T1',
          'T2',
          'T3',
          'T4',
          'T5',
          'T6',
          'T7',
          'T8',
          'T9',
          'T10',
          'T11',
          'T12',
        ],
        datasets: [
          {
            label: 'Người dùng mới',
            data: this.chartData.userGrowth,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  createRoomStatusChart(): void {
    const ctx = document.getElementById('roomStatusChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.roomStatusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Đã thuê', 'Còn trống', 'Đang bảo trì'],
        datasets: [
          {
            data: this.chartData.roomStatus,
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: { legend: { display: false } },
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }
}
