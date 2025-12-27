import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { ReviewService } from '../../services/review.service';
import { RoomResponse } from '../../models/room.model';
import { BookingFormComponent } from '../booking/booking-form/booking-form.component';
import { ReviewComponent } from '../review/review.component';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    BookingFormComponent,
    ReviewComponent
  ],
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss']
})
export class RoomDetailComponent implements OnInit {
  room?: RoomResponse;
  showBookingForm = false;
  reviews: any[] = [];
  isLoading = true;
  readonly baseUrl = 'http://localhost:8080';

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadRoomDetails(id);
    }
  }

  loadRoomDetails(id: number) {
    this.roomService.getRoomById(id).subscribe({
      next: (res) => {
        this.room = res;
        this.isLoading = false;
        this.loadReviews(id);
      },
      error: () => this.isLoading = false
    });
  }

  loadReviews(roomId: number) {
    this.reviewService.getByRoom(roomId).subscribe(res => this.reviews = res);
  }

  getImgUrl(url: string): string {
    if (!url) return 'assets/images/no-image.jpg';
    return url.startsWith('http') ? url : `${this.baseUrl}${url}`;
  }
  toggleBookingForm() {
    this.showBookingForm = !this.showBookingForm;
  }

  // Hàm này chạy khi form bên trong báo thành công
  onBookingSuccess() {
    this.showBookingForm = false;
    // Bạn có thể thêm thông báo thành công hoặc redirect ở đây
  }
}