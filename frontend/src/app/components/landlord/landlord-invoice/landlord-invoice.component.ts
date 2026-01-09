// landlord-invoice.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../services/invoice.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-landlord-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landlord-invoice.component.html',
  styleUrl: './landlord-invoice.component.scss'
})
export class LandlordInvoiceComponent implements OnInit {
  invoices: any[] = [];
  activeContracts: any[] = [];
  showModal = false;
  isEditMode = false;
  isLoading = false;

  invoiceForm: any = {
    id: null,
    contractId: '',
    tenantId: null,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 0,
    status: 'UNPAID'
  };

  constructor(
    private invoiceService: InvoiceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // 1. Xử lý thông báo sau khi VNPay redirect về
    this.route.queryParams.subscribe((params) => {
      const status = params['payment_status'];
      if (status === '00') {
        alert('Thanh toán hóa đơn thành công!');
        this.clearUrlParams();
      } else if (status && status !== '00') {
        alert('Thanh toán thất bại hoặc đã bị hủy.');
        this.clearUrlParams();
      }
      this.loadInvoices();
    });

    this.loadActiveContracts();
  }

  clearUrlParams() {
    window.history.replaceState({}, '', window.location.pathname);
  }

  loadInvoices() {
    this.isLoading = true;
    const landlordId = Number(localStorage.getItem('userId'));
    this.invoiceService.getInvoices(landlordId, 'LANDLORD').subscribe({
      next: (res) => {
        this.invoices = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải hóa đơn:', err);
        this.isLoading = false;
      }
    });
  }

  loadActiveContracts() {
    const landlordId = localStorage.getItem('userId');
    this.invoiceService.getActiveContractsByLandlord(landlordId).subscribe({
      next: (res) => {
        if (res?.data) {
          this.activeContracts = res.data.filter((c: any) =>
            c.status === 'APPROVED' || c.status === 'ACTIVE'
          );
        }
      },
      error: (err) => console.error('Lỗi tải hợp đồng:', err)
    });
  }

  // Duyệt tiền mặt thủ công qua Service
  markAsPaid(inv: any) {
    if (confirm(`Xác nhận hóa đơn #${inv.id} đã thu tiền mặt thành công?`)) {
      this.invoiceService.verifyPayment(inv.id, '00').subscribe({
        next: () => {
          alert('Đã cập nhật trạng thái: ĐÃ THANH TOÁN');
          this.loadInvoices();
        },
        error: (err) => alert('Lỗi cập nhật: ' + (err.error?.message || err.message))
      });
    }
  }

  // Xóa hóa đơn qua Service
  deleteInvoice(id: any) {
    if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
      this.invoiceService.deleteInvoice(id).subscribe({
        next: () => {
          alert('Đã xóa thành công');
          this.loadInvoices();
        },
        error: (err) => alert('Lỗi khi xóa: ' + (err.error?.message || 'Hóa đơn đã thanh toán không thể xóa'))
      });
    }
  }

  // Lưu/Cập nhật qua Service
  saveInvoice() {
    if (!this.invoiceForm.contractId || this.invoiceForm.amount <= 0) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const landlordId = Number(localStorage.getItem('userId'));
    const payload = { ...this.invoiceForm, landlordId };

    if (this.isEditMode) {
      // Gọi Update thông qua Service
      this.invoiceService.updateInvoice(this.invoiceForm.id, payload).subscribe({
        next: () => this.handleSuccess('Cập nhật thành công'),
        error: (err) => alert('Lỗi: Hóa đơn đã thanh toán không thể chỉnh sửa')
      });
    } else {
      // Gọi Create thông qua Service
      const contract = this.activeContracts.find(c => c.id == this.invoiceForm.contractId);
      this.invoiceService.createInvoice(payload, contract.monthlyRent, contract.deposit).subscribe({
        next: () => this.handleSuccess('Tạo hóa đơn thành công'),
        error: (err) => alert('Lỗi: ' + (err.error?.message || 'Kỳ hạn này đã tồn tại hóa đơn'))
      });
    }
  }

  // Logic phụ trợ UI
  onContractChange() {
    const contract = this.activeContracts.find(c => c.id == this.invoiceForm.contractId);
    if (contract && !this.isEditMode) {
      this.invoiceForm.tenantId = contract.tenantId;
      const hasInvoice = this.invoices.some(i => i.contractId == contract.id);
      this.invoiceForm.amount = (!hasInvoice) ? (contract.monthlyRent + contract.deposit) : contract.monthlyRent;
    }
  }

  openCreateModal() {
    this.isEditMode = false;
    this.invoiceForm = {
      id: null, contractId: '', tenantId: null,
      month: new Date().getMonth() + 1, year: new Date().getFullYear(),
      amount: 0, status: 'UNPAID'
    };
    this.showModal = true;
  }

  editInvoice(inv: any) {
    this.isEditMode = true;
    this.invoiceForm = { ...inv };
    this.showModal = true;
  }

  handleSuccess(msg: string) {
    alert(msg);
    this.closeModal();
    this.loadInvoices();
  }

  closeModal() { this.showModal = false; }
}