import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { Review, ReviewRequest } from '../../models/review.model';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent {
  @Input() roomId!: number;
  @Input() reviews: Review[] = []; // Sử dụng kiểu Review đã định nghĩa
  @Output() reviewAdded = new EventEmitter<void>();

  newReview: ReviewRequest = {
    roomId: 0,
    rating: 5,
    comment: ''
  };

  stars = [1, 2, 3, 4, 5];
  isSubmitting = false;

  constructor(private reviewService: ReviewService) {}

  setRating(val: number): void {
    this.newReview.rating = val;
  }

  submitReview(): void {
    if (!this.newReview.comment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    this.isSubmitting = true;
    this.newReview.roomId = this.roomId;

    this.reviewService.createReview(this.newReview).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.newReview.comment = '';
        this.reviewAdded.emit();
        alert('Cảm ơn bạn đã gửi đánh giá!');
      },
      error: (err: any) => { // Thêm kiểu dữ liệu cho err
        this.isSubmitting = false;
        alert('Lỗi: ' + (err.error?.message || 'Bạn cần đăng nhập để thực hiện chức năng này.'));
      }
    });
  }

  getStarsArray(n: number): number[] { 
    return Array(n).fill(0); 
  }
}