export interface BookingRequest {
  roomId: number;
  landlordId: number;
  fullName: string;
  cccd: string;
  phone: string;
  address: string;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  notes: string;
}