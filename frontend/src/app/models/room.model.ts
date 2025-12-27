export interface Amenity {
  id?: number;
  name: string;
  icon?: string;
  description?: string;
}

export interface RoomResponse {
  id: number;
  name: string;
  price: number;
  area: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'REPAIRING';
  address: string;
  buildingId: number;
  buildingName: string;
  imageUrls: string[];
  amenities: Amenity[]; // Thay đổi từ string[] thành Amenity[]
  description: string;
  landlordId: number; 
}

export interface RoomRequest {
  buildingId: number;
  name: string;
  price: number;
  area: number;
  status: string;
  description: string;
  amenityIds: number[];
  imageUrls: string[];
}