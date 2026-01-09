export enum Role {
  ADMIN = 0,
  LANDLORD = 1,
  TENANT = 2
}

// Tương ứng với UserDto ở Backend
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;   // Nhận chuỗi "ADMIN", "TENANT"... từ DTO
  status: string; // "ACTIVE", "BANNED"...
  createdAt?: string;
}

// Tương ứng với UserUpdateDto ở Backend
export interface UserUpdate {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: string;
  role?: string;
}

export interface UserCreate {
  username?: string;
  password?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string | number;
}