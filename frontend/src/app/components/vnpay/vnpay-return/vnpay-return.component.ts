import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../../services/invoice.service';

@Component({
  selector: 'app-vnpay-return',
  template: `
    <div class="container text-center mt-5">
      <div *ngIf="loading">Đang xác thực giao dịch...</div>
      <div *ngIf="!loading && success" class="alert alert-success">
        <h3>Thanh toán thành công!</h3>
        <button (click)="goToInvoices()">Xem hóa đơn</button>
      </div>
      <div *ngIf="!loading && !success" class="alert alert-danger">
        <h3>Thanh toán thất bại hoặc bị hủy.</h3>
        <button (click)="goToInvoices()">Quay lại</button>
      </div>
    </div>
  `
})
export class VnpayReturnComponent implements OnInit {
  loading = true; success = false;

  constructor(private route: ActivatedRoute, private invoiceService: InvoiceService, private router: Router) {}

  ngOnInit() {
  this.route.queryParams.subscribe(params => {
    const code = params['vnp_ResponseCode'];
    // Lấy invoiceId từ vnp_TxnRef (đảm bảo nó là số nguyên)
    const rawInvoiceId = params['vnp_TxnRef'];
    const invoiceId = Number(rawInvoiceId);

    if (code === '00' && !isNaN(invoiceId)) {
      this.invoiceService.verifyPayment(invoiceId, code).subscribe({
        next: (res) => {
          console.log('Cập nhật trạng thái thành công:', res);
          this.loading = false;
          this.success = true;
        },
        error: (err) => {
          console.error('Lỗi xác thực hoặc cập nhật database:', err);
          this.loading = false;
          this.success = false;
        }
      });
    } else {
      this.loading = false;
      this.success = false;
    }
    });
  }

  goToInvoices() { this.router.navigate(['/tenant/invoices']); }
}