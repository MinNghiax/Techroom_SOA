import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LandlordRequestService } from '../../services/landlord-request.service';

@Component({
  selector: 'app-landlord-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landlord-request.component.html',
  styleUrls: ['./landlord-request.component.scss']
})
export class LandlordRequestComponent {
  requestData = {
    cccd: '',
    address: '',
    roomCount: 1,
    frontImage: null as File | null,
    backImage: null as File | null,
    licenseImage: null as File | null
  };

  // Preview URLs cho các ảnh
  frontImagePreview: string | null = null;
  backImagePreview: string | null = null;
  licenseImagePreview: string | null = null;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Max file size: 5MB
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024;
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

  constructor(
    private landlordRequestService: LandlordRequestService,
    private router: Router
  ) {}

  /**
   * Xử lý khi người dùng chọn file
   */
  onFileChange(event: any, field: 'frontImage' | 'backImage' | 'licenseImage') {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }

    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage = 'Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG!';
      event.target.value = ''; // Reset input
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.errorMessage = 'Kích thước file không được vượt quá 5MB!';
      event.target.value = ''; // Reset input
      return;
    }

    // Clear error message if validation passes
    this.errorMessage = '';
    this.requestData[field] = file;

    // Tạo preview URL
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (field === 'frontImage') {
        this.frontImagePreview = e.target.result;
      } else if (field === 'backImage') {
        this.backImagePreview = e.target.result;
      } else if (field === 'licenseImage') {
        this.licenseImagePreview = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Xóa ảnh đã chọn
   */
  removeImage(field: 'frontImage' | 'backImage' | 'licenseImage', inputElement: HTMLInputElement) {
    this.requestData[field] = null;
    inputElement.value = ''; // Reset input element

    // Clear preview
    if (field === 'frontImage') {
      this.frontImagePreview = null;
    } else if (field === 'backImage') {
      this.backImagePreview = null;
    } else if (field === 'licenseImage') {
      this.licenseImagePreview = null;
    }
  }

  /**
   * Kiểm tra form có hợp lệ không
   */
  isFormValid(): boolean {
    return !!(
      this.requestData.cccd &&
      this.requestData.address &&
      this.requestData.roomCount > 0 &&
      this.requestData.frontImage &&
      this.requestData.backImage
    );
  }

  /**
   * Submit form đăng ký chủ trọ
   */
  onSubmit() {
    // Validate trước khi submit
    if (!this.isFormValid()) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin bắt buộc!';
      return;
    }

    // Reset messages và bật loading
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.landlordRequestService.submitRequest(this.requestData).subscribe({
      next: (res) => {
        this.successMessage = 'Gửi yêu cầu thành công! Chúng tôi sẽ xét duyệt trong vòng 1-3 ngày làm việc.';
        this.isLoading = false;

        // Chuyển hướng về trang chủ sau 3 giây
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (err: any) => {
        this.isLoading = false;

        // Xử lý các loại lỗi cụ thể
        if (err.status === 409) {
          this.errorMessage = 'Bạn đã gửi yêu cầu xác thực trước đó. Vui lòng chờ xét duyệt.';
        } else if (err.status === 400) {
          // Bad request - validation error
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.';
          }
        } else if (err.status === 413) {
          this.errorMessage = 'File tải lên quá lớn. Vui lòng chọn file nhỏ hơn 5MB.';
        } else if (err.status === 415) {
          this.errorMessage = 'Định dạng file không được hỗ trợ. Chỉ chấp nhận JPG, PNG.';
        } else if (err.status === 0) {
          this.errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Gửi yêu cầu thất bại! Vui lòng thử lại sau.';
        }

        console.error('Landlord request error:', err);
      }
    });
  }
}