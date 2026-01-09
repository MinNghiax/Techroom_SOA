// invoice.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private apiUrl = `${environment.apiBaseUrl}/invoices`;
  // Giả định API Booking cũng đi qua Gateway
  private bookingUrl = `${environment.apiBaseUrl}/bookings`; 

  constructor(private http: HttpClient) {}

  getInvoices(userId: number, role: string): Observable<any[]> {
    const path = role === 'LANDLORD' ? 'landlord' : 'tenant';
    return this.http.get<any[]>(`${this.apiUrl}/${path}/${userId}`);
  }

  createInvoice(invoiceData: any, rent: number, deposit: number): Observable<any> {
    const params = new HttpParams()
      .set('rent', rent.toString())
      .set('deposit', deposit.toString());
    return this.http.post<any>(`${this.apiUrl}/create`, invoiceData, { params });
  }

  updateInvoice(id: number, invoiceData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, invoiceData);
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPaymentUrl(invoiceId: number): Observable<{url: string}> {
    return this.http.get<{url: string}>(`${this.apiUrl}/${invoiceId}/pay-url`);
  }

  verifyPayment(invoiceId: number, code: string): Observable<any> {
    // Phương thức này dùng cho duyệt thủ công hoặc verify nhanh
    return this.http.get(`${this.apiUrl}/verify`, {
      params: { invoiceId: invoiceId.toString(), code: code }
    });
  }

  // Chuyển việc lấy hợp đồng vào service để quản lý tập trung
  getActiveContractsByLandlord(landlordId: string | null): Observable<any> {
    return this.http.get<any>(`${this.bookingUrl}/landlord-contracts/${landlordId}`);
  }
}