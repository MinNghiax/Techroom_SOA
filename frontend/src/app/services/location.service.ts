import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Import environment

@Injectable({ providedIn: 'root' })
export class LocationService {
  // Sử dụng apiBaseUrl từ environment (8080)
  private apiUrl = `${environment.apiBaseUrl}/locations`; 

  constructor(private http: HttpClient) {}

  getProvinces(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/provinces`);
  }

  getDistricts(provinceCode: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/districts/${provinceCode}`);
  }
}