import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../../services/review.service';

@Component({
  selector: 'app-admin-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-report.component.html',
  styleUrls: ['./admin-report.component.scss']
})
export class AdminReportComponent implements OnInit {
  reports: any[] = [];

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    // Lấy danh sách báo cáo vi phạm từ ReviewService
    this.reviewService.getAdminReports().subscribe({
      next: (res) => this.reports = res,
      error: (err) => console.error('Lỗi tải báo cáo:', err)
    });
  }

  /**
   * Xóa review vi phạm dựa trên báo cáo
   * @param reportId ID của báo cáo
   */
  deleteReview(reportId: number): void {
    if (confirm('Báo cáo này vi phạm nghiêm trọng, bạn chắc chắn muốn XÓA review này?')) {
      // Gọi service xóa review từ phía Admin
      this.reviewService.deleteReviewByReport(reportId).subscribe({
        next: () => {
          alert('Đã xóa review vi phạm thành công!');
          this.loadReports(); // Tải lại danh sách sau khi xóa
        },
        error: (err) => {
          alert('Lỗi 500: Hãy kiểm tra ràng buộc Database (ON DELETE CASCADE)');
          console.error(err);
        }
      });
    }
  }

  /**
   * Cập nhật trạng thái báo cáo mà không xóa review
   */
  handleReport(id: number, status: string): void {
    const msg = status === 'RESOLVED' ? 'Duyệt báo cáo này?' : 'Bỏ qua báo cáo này?';
    if (confirm(msg)) {
      this.reviewService.updateReportStatus(id, status).subscribe(() => {
        this.loadReports();
      });
    }
  }
}