export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RejectDTO {
  reason: string;
}

// Giữ nguyên các Interface khác của bạn...
export interface BookingDTO {
  roomId: number;
  landlordId: number;
  fullName: string;
  cccd: string;
  phone: string;
  address: string;
  startDate: string; // ISO Date string
  endDate: string;
  deposit: number;
  monthlyRent: number;
  notes?: string;
}

export interface Contract {
  id: number;
  contractCode: string;
  roomId: number;
  tenantId: number;
  landlordId: number;
  fullName: string;
  cccd: string;
  phone: string;
  address: string;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'REJECTED';
  rejectionReason?: string;
}