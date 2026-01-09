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

  stats = {
    totalPendingAmount: 0,
    countPending: 0,
    countPaid: 0,
    totalPaidAmount: 0
  };

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit() {
    this.loadMyInvoices();
  }
  
  loadMyInvoices() {
    const tenantId = Number(localStorage.getItem('userId'));
    this.invoiceService.getInvoices(tenantId, 'TENANT').subscribe(res => {
      this.invoices = res;
      this.calculateStats(); // Gọi hàm tính toán sau khi nhận dữ liệu
    });
  }

  // Hàm tính toán các chỉ số thống kê
  calculateStats() {
    this.stats = this.invoices.reduce((acc, inv) => {
      if (inv.status === 'PAID') {
        acc.countPaid++;
        acc.totalPaidAmount += inv.amount;
      } else {
        acc.countPending++;
        acc.totalPendingAmount += inv.amount;
      }
      return acc;
    }, { totalPendingAmount: 0, countPending: 0, countPaid: 0, totalPaidAmount: 0 });
  }

  paymentVnpay(invoiceId: number) {
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