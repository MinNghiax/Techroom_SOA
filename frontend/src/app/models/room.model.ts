export interface RoomResponse {
  id: number;
  name: string;
  price: number;
  area: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'REPAIRING';
  address: string;
  buildingName: string;
  imageUrls: string[];
  amenities: string[];
  description: string;
}

export interface RoomRequest {
  buildingId: number;
  name: string;
  price: number;
  area: number;
  status: string;
  description: string;
  amenityIds: number[];
}