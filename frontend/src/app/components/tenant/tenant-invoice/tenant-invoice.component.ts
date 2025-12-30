import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../services/invoice.service';

@Component({
  selector: 'app-tenant-invoice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-invoice.component.html',
  styleUrl: './tenant-invoice.component.scss'
})
export class TenantInvoiceComponent implements OnInit {
  invoices: any[] = [];

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit() {
    this.loadMyInvoices();
  }

  loadMyInvoices() {
    const tenantId = Number(localStorage.getItem('userId'));
    this.invoiceService.getInvoices(tenantId, 'TENANT').subscribe(res => {
      this.invoices = res;
    });
  }

  handlePayment(invoiceId: number) {
    this.invoiceService.getPaymentUrl(invoiceId).subscribe({
      next: (res) => {
        if (res.url) {
          window.location.href = res.url; // Chuyển hướng sang VNPAY
        }
      },
      error: () => alert('Không thể khởi tạo thanh toán VNPAY')
    });
  }
}