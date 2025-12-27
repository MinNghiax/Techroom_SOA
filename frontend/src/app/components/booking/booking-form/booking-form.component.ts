import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss'] // Đảm bảo bạn có file scss nếu cần
})
export class BookingFormComponent implements OnInit {
  // Đổi tên thành roomInfo để khớp với HTML của bạn
  @Input() roomInfo: any; 

  bookingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      fullName: ['', Validators.required],
      cccd: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      notes: ['']
    });
  }

  onSubmit() {
  if (this.bookingForm.valid && this.roomInfo) {
    // Thêm dòng này để kiểm tra ngay lập tức giá trị landlordId
    if (!this.roomInfo.landlordId) {
      console.error("LỖI: roomInfo không có landlordId!", this.roomInfo);
      alert("Lỗi dữ liệu: Không tìm thấy ID chủ trọ từ phòng này.");
      return;
    }
    // 1. Tạo DTO và ép kiểu dữ liệu cực kỳ cẩn thận
    const dto = {
      fullName: String(this.bookingForm.get('fullName')?.value),
      cccd: String(this.bookingForm.get('cccd')?.value),
      phone: String(this.bookingForm.get('phone')?.value),
      address: String(this.bookingForm.get('address')?.value),
      startDate: this.bookingForm.get('startDate')?.value, 
      endDate: this.bookingForm.get('endDate')?.value,     
      notes: this.bookingForm.get('notes')?.value || '',
      
      // Ép kiểu số cho các ID và tiền tệ
      roomId: Number(this.roomInfo.id),
      landlordId: Number(this.roomInfo.landlordId),
      deposit: Number(this.roomInfo.price * 2),
      monthlyRent: Number(this.roomInfo.price)
    };

    // 2. LOG dữ liệu ra để bạn tự kiểm tra trong Console (F12)
    console.log("Dữ liệu gửi lên Backend:", dto);

    this.bookingService.createBooking(dto).subscribe({
      next: (res) => {
        alert('Đặt phòng thành công! Chờ chủ trọ duyệt.');
        this.router.navigate(['/tenant/my-contracts']);
      },
      error: (err) => {
        // 3. LOG lỗi chi tiết từ Backend trả về
        console.error("Lỗi chi tiết từ Server:", err);
        
        // Hiển thị thông báo lỗi cụ thể từ Backend nếu có
        const errorMsg = err.error?.message || err.message || 'Dữ liệu không hợp lệ (400)';
        alert('Lỗi: ' + errorMsg);
      }
    });
  } else if (!this.roomInfo) {
    alert('Lỗi: Không tìm thấy thông tin phòng!');
  }
}
}