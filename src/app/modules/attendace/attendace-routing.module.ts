import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { PunchInTransactionsComponent } from './components/punch-in-transactions/punch-in-transactions.component';
import { ChangeAttendanceTimeDirectlyComponent } from './components/change-attendance-time-directly/change-attendance-time-directly.component';
import { AttendaceComponent } from './components/attendace/attendace.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'data',
    pathMatch: 'full'
  },
  {
    path: 'data',
    component: AttendaceComponent
  },

  {
    path: 'punch-in-transactions',
    component: PunchInTransactionsComponent
  },
  {
    path: 'view-attendance',
    component: AttendanceComponent
  },
  {
    path: 'change-attendance-time',
    component: ChangeAttendanceTimeDirectlyComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendaceRoutingModule { }
