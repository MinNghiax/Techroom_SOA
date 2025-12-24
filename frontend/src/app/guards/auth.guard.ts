import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

const checkRole = (expectedRole: string): boolean => {
  const router = inject(Router);
  const userRole = localStorage.getItem('userRole'); // Lấy ADMIN, LANDLORD hoặc TENANT

  if (userRole === expectedRole) {
    return true;
  }

  // Nếu không đúng quyền, đẩy về trang login hoặc trang chủ
  router.navigate(['/login']);
  return false;
};

// Guard cho Admin (Role 0)
export const adminGuard: CanActivateFn = () => checkRole('ADMIN');

// Guard cho Landlord (Role 1)
export const landlordGuard: CanActivateFn = () => checkRole('LANDLORD');

// Guard cho Tenant (Role 2)
export const tenantGuard: CanActivateFn = () => checkRole('TENANT');