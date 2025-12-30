import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private apiUrl = `${environment.apiBaseUrl}/invoices`; 

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

  getPaymentUrl(invoiceId: number): Observable<{url: string}> {
    return this.http.get<{url: string}>(`${this.apiUrl}/${invoiceId}/pay-url`);
  }


  verifyPayment(invoiceId: number, code: string): Observable<any> {
    // Đảm bảo URL này đi qua Gateway và trỏ đến đúng /api/invoices/verify
    return this.http.get(`http://localhost:8080/api/invoices/verify`, {
      params: { 
        invoiceId: invoiceId.toString(), 
        code: code 
      }
    });
  }
}