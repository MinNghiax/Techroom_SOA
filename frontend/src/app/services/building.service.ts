import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  // URL gốc từ environment (ví dụ: http://localhost:8080/api/buildings)
  private apiUrl = `${environment.apiBaseUrl}/buildings`;

  constructor(private http: HttpClient) {}

  /**
   * 1. Lấy toàn bộ danh sách tòa nhà công khai (Cho khách xem ở trang Home)
   */
  getBuildings(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * 2. Lấy danh sách tòa nhà của CHÍNH CHỦ NHÀ đang đăng nhập.
   * THAY ĐỔI: Không truyền ID qua URL để tránh lộ dữ liệu hoặc xem nhầm.
   * Backend sẽ lấy ID từ Access Token qua Header X-User-Id.
   */
  getBuildingsByLandlord(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/landlord/my`);
  }

  /**
   * 3. Tạo tòa nhà mới
   */
  createBuilding(buildingData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, buildingData);
  }

  /**
   * 4. Cập nhật thông tin tòa nhà
   */
  updateBuilding(id: number, buildingData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, buildingData);
  }

  /**
   * 5. Xóa tòa nhà
   */
  deleteBuilding(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}