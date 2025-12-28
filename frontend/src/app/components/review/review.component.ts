import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { Review, ReviewRequest } from '../../models/review.model';
// QUAN TRỌNG: Phải import AuthService thì mới hết lỗi -992003
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  @Input() roomId!: number;
  @Input() reviews: any[] = [];
  @Output() reviewAdded = new EventEmitter<void>();

  newReview: ReviewRequest = { roomId: 0, rating: 5, comment: '' };
  isSubmitting = false;
  isEditing = false;
  editingId: number | null = null;
  stars = [1, 2, 3, 4, 5];

  // AuthService phải được import ở trên và khai báo trong constructor
  constructor(private reviewService: ReviewService, public authService: AuthService) {}

  ngOnInit(): void {
    this.newReview.roomId = this.roomId;
  }

  getCurrentUserId(): number {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : 0;
  }

  setRating(val: number): void { this.newReview.rating = val; }

  submitReview(): void {
    if (!this.newReview.comment.trim()) return;
    this.isSubmitting = true;
    this.newReview.roomId = this.roomId;
    
    const obs = (this.isEditing && this.editingId) 
      ? this.reviewService.updateReview(this.editingId, this.newReview)
      : this.reviewService.createReview(this.newReview);

    obs.subscribe({
      next: () => {
        alert(this.isEditing ? 'Cập nhật thành công!' : 'Gửi đánh giá thành công!');
        this.resetForm();
        this.reviewAdded.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Lỗi: ' + (err.error?.message || 'Không thể thực hiện thao tác này.'));
      }
    });
  }

  onEdit(r: any): void {
    this.isEditing = true;
    this.editingId = r.id;
    this.newReview.comment = r.comment;
    this.newReview.rating = r.rating;
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  onDelete(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      this.reviewService.deleteReview(id).subscribe({
        next: () => {
          alert('Đã xóa đánh giá thành công!');
          this.reviewAdded.emit();
        },
        error: (err) => alert('Lỗi: ' + (err.error?.message || 'Không thể xóa'))
      });
    }
  }

  onReport(id: number): void {
    const reason = prompt('Nhập lý do báo cáo:');
    if (reason) {
      this.reviewService.reportReview(id, reason, 'Người dùng báo cáo vi phạm').subscribe({
        next: () => alert('Đã gửi báo cáo!'),
        error: () => alert('Bạn cần đăng nhập để thực hiện chức năng này.')
      });
    }
  }

  resetForm(): void {
    this.isSubmitting = false;
    this.isEditing = false;
    this.editingId = null;
    this.newReview.comment = '';
    this.newReview.rating = 5;
  }

  getStarsArray(n: number): number[] { return Array(Math.round(n)).fill(0); }
}