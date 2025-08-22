import { Routes } from '@angular/router';

import { Login } from './pages/auth/login/login';
import { MainLayoutComponent } from './main-layout-component/main-layout-component';
import { DashboardAdmin } from './pages/admin/dashboard-admin/dashboard-admin';
import { HolidaysComponent } from './pages/admin/holidays/holidays';
import { EmployeeProfile } from './pages/admin/manage-employees/employee-profile/employee-profile';
import { ManageEmployees } from './pages/admin/manage-employees/manage-employees';
import { ManageRequests } from './pages/admin/manage-requests/manage-requests';
import { StatisticsComponent } from './pages/admin/statistics/statistics';
import { AdminProfileComponent } from './pages/admin/admin-profile/admin-profile';
import { ApplyLeave } from './pages/apply-leave/apply-leave';
import { CalendarLeave } from './pages/calendar-leave/calendar-leave';
import { Dashboard } from './pages/dashboard/dashboard';
import { LeaveBalance } from './pages/leave-balance/leave-balance';
import { MyRequests } from './pages/my-requests/my-requests';

import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: Login }, // ❌ NO LAYOUT

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        component: Dashboard,
        canActivate: [RoleGuard],
        data: { requiredRole: 'EMPLOYEE' }
      },
      { 
        path: 'myRequests', 
        component: MyRequests,
        canActivate: [RoleGuard],
        data: { requiredRole: 'EMPLOYEE' }
      },
      { 
        path: 'ApplyLeave', 
        component: ApplyLeave,
        canActivate: [RoleGuard],
        data: { requiredRole: 'EMPLOYEE' }
      },
      { 
        path: 'CalendarLeave', 
        component: CalendarLeave,
        canActivate: [RoleGuard],
        data: { requiredRole: 'EMPLOYEE' }
      },
      { 
        path: 'LeaveBalance', 
        component: LeaveBalance,
        canActivate: [RoleGuard],
        data: { requiredRole: 'EMPLOYEE' }
      },
      // Employee profile component was removed
      // { 
      //   path: 'profile', 
      //   component: EmployeeProfileComponent,
      //   canActivate: [RoleGuard],
      //   data: { requiredRole: 'EMPLOYEE' }
      // },
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { requiredRole: 'ADMIN' },
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: DashboardAdmin },
          { path: 'manage-employees', component: ManageEmployees },
          { path: 'manage-employees/profile/:id', component: EmployeeProfile },
          { path: 'manage-requests', component: ManageRequests },
          { path: 'holidays', component: HolidaysComponent },
          { path: 'statistics', component: StatisticsComponent },
          { path: 'profile', component: AdminProfileComponent },
        ],
      },
    ],
  },
  
  // Catch all route - redirect to login if not authenticated, otherwise to dashboard
  { path: '**', redirectTo: 'login' }
];
