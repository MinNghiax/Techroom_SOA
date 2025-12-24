import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private apiUrl = `${environment.apiBaseUrl}/buildings`;

  constructor(private http: HttpClient) {}

  // Lấy toàn bộ danh sách tòa nhà
  getBuildings(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Tạo tòa nhà mới (Landlord)
  createBuilding(buildingData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, buildingData);
  }
}