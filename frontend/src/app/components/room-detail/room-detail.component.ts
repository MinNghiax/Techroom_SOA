import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { ReviewService } from '../../services/review.service';
import { RoomResponse } from '../../models/room.model';
import { BookingFormComponent } from '../booking/booking-form/booking-form.component';
import { ReviewComponent } from '../review/review.component'; // Ensure this matches your folder structure

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    BookingFormComponent,
    ReviewComponent // Added comma and included the component correctly
  ],
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss']
})
export class RoomDetailComponent implements OnInit {
  room?: RoomResponse;
  reviews: any[] = [];
  isLoading = true;

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
}