import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 1. Thêm import này
import { BookingService } from '../../../services/booking.service';
import { BookingRequest } from '../../../models/booking.model';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule], // 2. Thêm FormsModule vào đây
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent implements OnInit {
  @Input() roomId!: number;
  @Input() landlordId: number = 1;

  // 3. Đảm bảo tên biến là 'bookingData' để khớp với logic nộp form của bạn
  bookingData: BookingRequest = {
    roomId: 0,
    landlordId: 0,
    fullName: '',
    cccd: '',
    phone: '',
    address: '',
    startDate: '',
    endDate: '',
    deposit: 0,
    monthlyRent: 0,
    notes: ''
  };

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingData.roomId = this.roomId;
    this.bookingData.landlordId = this.landlordId;
  }

  onBook() {
    this.bookingService.createBooking(this.bookingData).subscribe({
      next: (res) => alert('Thành công!'),
      error: (err) => alert('Lỗi!')
    });
  }
}