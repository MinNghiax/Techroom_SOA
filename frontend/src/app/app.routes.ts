import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

// Các imports component khác của bạn giữ nguyên
import { HomeComponent } from './components/home/home.component';
import { RoomListComponent } from './components/room-list/room-list.component';
import { RoomDetailComponent } from './components/room-detail/room-detail.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { StatisticsComponent } from './components/admin/statistics/statistics.component';
import { MyBookingsComponent } from './components/tenant/my-bookings/my-bookings.component';
import { ManageRoomsComponent } from './components/landlord/manage-rooms/manage-rooms.component';
import { ManageBuildingsComponent } from './components/landlord/manage-buildings/manage-buildings.component';
import { AdminUsersComponent } from './components/admin/admin-users/admin-users.component';
import { ContractManagementComponent } from './components/landlord/contract-management/contract-management.component';
import { AdminReportComponent } from './components/admin/admin-report/admin-report.component';
import { VnpayReturnComponent } from './components/vnpay/vnpay-return/vnpay-return.component';
import { TenantInvoiceComponent } from './components/tenant/tenant-invoice/tenant-invoice.component';
import { LandlordInvoiceComponent } from './components/landlord/landlord-invoice/landlord-invoice.component';
import { LandlordRequestComponent } from './components/landlord-request/landlord-request.component';
import { LandlordRequestsComponent } from './components/admin/landlord-requests/landlord-requests.component';
import { adminGuard, landlordGuard, tenantGuard } from './guards/auth.guard';

export const routes: Routes = [
  // 1. Giao diện người dùng (Header ngang)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'rooms', component: RoomListComponent },
      { path: 'rooms/:id', component: RoomDetailComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'landlord-request', component: LandlordRequestComponent },
      { path: 'tenant/vnpay-return', component: VnpayReturnComponent },
      
      // Tenant Routes
      {
        path: 'tenant',
        canActivate: [tenantGuard],
        children: [
          { path: 'my-bookings', component: MyBookingsComponent },
          { path: 'tenant-invoices', component: TenantInvoiceComponent }
        ]
      },
      
      // Landlord Routes
      {
        path: 'landlord',
        canActivate: [landlordGuard],
        children: [
          { path: 'manage-rooms', component: ManageRoomsComponent },
          { path: 'manage-buildings', component: ManageBuildingsComponent },
          { path: 'contract-management', component: ContractManagementComponent },
          { path: 'landlord-invoices', component: LandlordInvoiceComponent }
        ]
      }
    ]
  },

  // 2. Giao diện Admin (Sidebar dọc)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'statistics', component: StatisticsComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'reports', component: AdminReportComponent },
      { path: 'landlord-requests', component: LandlordRequestsComponent },
      { path: '', redirectTo: 'statistics', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];