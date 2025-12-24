export interface Building {
  id: number;
  name: string;               // Tên tòa nhà/khu trọ
  address: string;            // Số nhà, tên đường
  description?: string;       // Mô tả chi tiết (optional)
  
  // Các thông tin địa lý (đã được Backend xử lý từ ID sang Name)
  provinceName: string;       
  districtName: string;
  
  // Thông tin quản lý
  managerName?: string;
  managerPhone?: string;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// Nếu bạn cần gửi dữ liệu lên (Request DTO)
export interface BuildingRequest {
  name: string;
  address: string;
  description: string;
  provinceId: number;
  districtId: number;
}