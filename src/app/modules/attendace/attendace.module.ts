import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttendaceRoutingModule } from './attendace-routing.module';
import { AttendaceComponent } from './components/attendace/attendace.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { PunchInTransactionsComponent } from './components/punch-in-transactions/punch-in-transactions.component';
import { ChangeAttendanceTimeDirectlyComponent } from './components/change-attendance-time-directly/change-attendance-time-directly.component';



@NgModule({
  declarations: [
    AttendaceComponent,
    AttendanceComponent,
    PunchInTransactionsComponent,
    ChangeAttendanceTimeDirectlyComponent
  ],
  imports: [
    CommonModule,
    AttendaceRoutingModule
  ]
})
export class AttendaceModule { }
