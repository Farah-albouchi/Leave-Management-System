import { Routes } from '@angular/router';

import { Login } from './pages/auth/login/login';
import { MainLayoutComponent } from './main-layout-component/main-layout-component';
import { DashboardAdmin } from './pages/admin/dashboard-admin/dashboard-admin';
import { HolidaysComponent } from './pages/admin/holidays/holidays';
import { EmployeeProfile } from './pages/admin/manage-employees/employee-profile/employee-profile';
import { ManageEmployees } from './pages/admin/manage-employees/manage-employees';
import { ManageRequests } from './pages/admin/manage-requests/manage-requests';
import { StatisticsComponent } from './pages/admin/statistics/statistics';
import { ApplyLeave } from './pages/apply-leave/apply-leave';
import { CalendarLeave } from './pages/calendar-leave/calendar-leave';
import { Dashboard } from './pages/dashboard/dashboard';
import { LeaveBalance } from './pages/leave-balance/leave-balance';
import { MyRequests } from './pages/my-requests/my-requests';

export const routes: Routes = [
  { path: 'login', component: Login }, // ❌ NO LAYOUT

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'myRequests', component: MyRequests },
      { path: 'ApplyLeave', component: ApplyLeave },
      { path: 'CalendarLeave', component: CalendarLeave },
      { path: 'LeaveBalance', component: LeaveBalance },
      {
        path: 'admin',
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: DashboardAdmin },
          { path: 'employees', component: ManageEmployees },
          { path: 'employees/:id', component: EmployeeProfile },
          { path: 'leave-requests', component: ManageRequests },
          { path: 'holidays', component: HolidaysComponent },
          { path: 'stats', component: StatisticsComponent },
        ],
      },
    ],
  },
];
