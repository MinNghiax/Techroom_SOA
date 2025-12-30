import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../services/invoice.service';
import { HttpClient } from '@angular/common/http';
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
    private http: HttpClient,
    private route: ActivatedRoute 
  ) {}

  ngOnInit() {
  this.route.queryParams.subscribe((params: any) => {
    // Kiểm tra tham số từ URL mà Backend vừa redirect về
    const status = params['payment_status'];
    
    if (status === '00') {
      alert('Thanh toán hóa đơn thành công!');
      // Xóa tham số trên URL để tránh hiện alert khi F5 trang
      window.history.replaceState({}, '', window.location.pathname);
    } else if (status && status !== '00') {
      alert('Thanh toán thất bại hoặc đã bị hủy.');
    }

    // Luôn gọi loadInvoices để lấy dữ liệu mới nhất (đã là PAID trong DB)
    this.loadInvoices(); 
  });
  
  this.loadActiveContracts();
  }

  loadInvoices() {
    const landlordId = Number(localStorage.getItem('userId'));
    this.invoiceService.getInvoices(landlordId, 'LANDLORD').subscribe({
      next: (res) => this.invoices = res,
      error: (err) => console.error('Lỗi tải hóa đơn:', err)
    });
  }

  // Chức năng chủ trọ duyệt thanh toán thủ công (Tiền mặt)
  markAsPaid(inv: any) {
    if (confirm(`Xác nhận hóa đơn #${inv.id} đã thu tiền mặt thành công?`)) {
      this.http.get(`http://localhost:8080/api/invoices/verify?invoiceId=${inv.id}&code=00`)
        .subscribe({
          next: () => {
            alert('Đã cập nhật trạng thái: ĐÃ THANH TOÁN');
            this.loadInvoices();
          },
          error: (err) => alert('Lỗi cập nhật: ' + err.message)
        });
    }
  }

  loadActiveContracts() {
    const landlordId = localStorage.getItem('userId');
    this.http.get<any>(`http://localhost:8080/api/bookings/landlord-contracts/${landlordId}`)
      .subscribe({
        next: (res) => {
          if (res?.data) {
            this.activeContracts = res.data.filter((c: any) => 
              c.status === 'APPROVED' || c.status === 'ACTIVE'
            );
          }
        }
      });
  }

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
      id: null,
      contractId: '',
      tenantId: null,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: 0,
      status: 'UNPAID'
    };
    this.showModal = true;
  }

  editInvoice(inv: any) {
    this.isEditMode = true;
    this.invoiceForm = { ...inv };
    this.showModal = true;
  }

  deleteInvoice(id: any) {
    if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
      this.http.delete(`http://localhost:8080/api/invoices/${id}`).subscribe({
        next: () => {
          alert('Đã xóa thành công');
          this.loadInvoices();
        },
        error: (err) => alert('Lỗi khi xóa: ' + (err.error?.message || 'Không thể xóa'))
      });
    }
  }

  saveInvoice() {
    if (!this.invoiceForm.contractId || this.invoiceForm.amount <= 0) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    const landlordId = Number(localStorage.getItem('userId'));
    const payload = { ...this.invoiceForm, landlordId };

    if (this.isEditMode) {
      this.http.put(`http://localhost:8080/api/invoices/${this.invoiceForm.id}`, payload)
        .subscribe({
          next: () => this.handleSuccess('Cập nhật thành công'),
          error: (err) => alert('Lỗi: ' + err.message)
        });
    } else {
      const contract = this.activeContracts.find(c => c.id == this.invoiceForm.contractId);
      this.invoiceService.createInvoice(payload, contract.monthlyRent, contract.deposit)
        .subscribe({
          next: () => this.handleSuccess('Tạo hóa đơn thành công'),
          error: (err) => alert('Lỗi: ' + (err.error?.message || 'Trùng kỳ hạn'))
        });
    }
  }

  handleSuccess(msg: string) {
    alert(msg);
    this.closeModal();
    this.loadInvoices();
  }

  closeModal() { this.showModal = false; }
}