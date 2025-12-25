import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Đảm bảo lấy từ port 8080

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private apiUrl = `${environment.apiBaseUrl}/buildings`;

  constructor(private http: HttpClient) {}

  // 1. Lấy toàn bộ danh sách (Cho trang Home)
  getBuildings(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 2. Lấy danh sách theo chủ nhà (Cho trang Quản lý)
  getBuildingsByLandlord(landlordId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/landlord/${landlordId}`);
  }

  // 3. Tạo tòa nhà mới
  createBuilding(buildingData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, buildingData);
  }

  // 4. Cập nhật tòa nhà
  updateBuilding(id: number, buildingData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, buildingData);
  }

  // 5. Xóa tòa nhà
  deleteBuilding(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}