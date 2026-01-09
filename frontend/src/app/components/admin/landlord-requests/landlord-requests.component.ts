import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LandlordRequestService } from '../../../services/landlord-request.service';
import { environment } from '../../../../environments/environment'; 

@Component({
  selector: 'app-admin-landlord-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landlord-requests.component.html',
  styleUrls: ['./landlord-requests.component.scss']
})
export class LandlordRequestsComponent implements OnInit {
  requests: any[] = [];
  isLoading = false;
  errorMessage = '';
  filterStatus = 'PENDING';

  modalImageUrl: string | null = null;

  constructor(private landlordRequestService: LandlordRequestService) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.landlordRequestService.getAllRequests(this.filterStatus).subscribe({
      next: (res: any[]) => {
        this.requests = res;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Lỗi tải danh sách yêu cầu!';
        this.isLoading = false;
      }
    });
  }

  approve(id: number): void {
    if (!confirm('Bạn chắc chắn muốn duyệt yêu cầu này?')) return;
    this.landlordRequestService.approveRequest(id).subscribe({
      next: () => {
        alert('Duyệt thành công!'); // Thêm thông báo
        this.loadRequests();
      },
      error: (err: any) => alert(err?.error?.message || 'Lỗi duyệt yêu cầu!')
    });
  }

  reject(id: number): void {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;
    this.landlordRequestService.rejectRequest(id, reason).subscribe({
      next: () => {
        alert('Đã từ chối yêu cầu!'); // Thêm thông báo
        this.loadRequests();
      },
      error: (err: any) => alert(err?.error?.message || 'Lỗi từ chối yêu cầu!')
    });
  }

  showImage(type: 'front' | 'back' | 'license', req: any): void {
    let filename = '';
    if (type === 'front') filename = req.frontImagePath;
    else if (type === 'back') filename = req.backImagePath;
    else if (type === 'license') filename = req.businessLicensePath;
    
    if (filename) {
      this.modalImageUrl = `http://localhost:8081/api/landlord-registration/uploads/${filename}`;
    }
  }

  closeImageModal(): void {
    this.modalImageUrl = null;
  }
}