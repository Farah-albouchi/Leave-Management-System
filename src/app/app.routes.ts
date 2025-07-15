import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { MyRequests } from './pages/my-requests/my-requests';
import { ApplyLeave } from './pages/apply-leave/apply-leave';
import { CalendarLeave } from './pages/calendar-leave/calendar-leave';
import { LeaveBalance } from './pages/leave-balance/leave-balance';


export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
  { path: 'dashboard', component: Dashboard },
  { path: 'myRequests', component: MyRequests },
  { path: 'ApplyLeave', component:ApplyLeave },
  {path:'CalendarLeave',component:CalendarLeave},
  {path:'LeaveBalance',component:LeaveBalance}

];
