import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RoomListComponent } from './components/room-list/room-list.component';
import { RoomDetailComponent } from './components/room-detail/room-detail.component';
import { BuildingListComponent } from './components/building-list/building-list.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';

// IMPORT CÁC GUARD Ở ĐÂY
import { adminGuard, landlordGuard, tenantGuard } from './guards/auth.guard';
import { StatisticsComponent } from './components/admin/statistics/statistics.component';
import { MyBookingsComponent } from './components/tenant/my-bookings/my-bookings.component';
import { ManageRoomsComponent } from './components/landlord/manage-rooms/manage-rooms.component';
import { ManageBuildingsComponent } from './components/landlord/manage-buildings/manage-buildings.component';
import { AdminUsersComponent } from './components/admin/admin-users/admin-users.component';
import { ContractManagementComponent } from './components/landlord/contract-management/contract-management.component';
import { AdminReportComponent } from './components/admin/admin-report/admin-report.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'rooms', component: RoomListComponent },
  { path: 'rooms/:id', component: RoomDetailComponent },

  // Nhóm các route cho Tenant (Role 2)
  { 
    path: 'tenant', 
    canActivate: [tenantGuard],
    children: [
      { path: 'my-bookings', component: MyBookingsComponent }
    ]
  },
  { 
    path: 'landlord', 
    canActivate: [landlordGuard],
    children: [
      { path: 'manage-rooms', component: ManageRoomsComponent },
      { path: 'manage-buildings', component: ManageBuildingsComponent },
      { path: 'contract-management', component: ContractManagementComponent }
    ]
  },
  { 
    path: 'admin', 
    canActivate: [adminGuard],
    children: [
      { path: 'users', component: AdminUsersComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: 'reports', component: AdminReportComponent } // THÊM DÒNG NÀY
    ]
  },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' },

  
];