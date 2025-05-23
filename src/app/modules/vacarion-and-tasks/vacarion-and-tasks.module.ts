import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VacarionAndTasksRoutingModule } from './vacarion-and-tasks-routing.module';
import { VacationsTasksComponent } from './components/vacations-tasks/vacations-tasks.component';
import { AttendanceStatusClassificationsComponent } from './components/attendance-status-classifications/attendance-status-classifications.component';
import { AttendanceStatusesComponent } from './components/attendance-statuses/attendance-statuses.component';
import { HandleStatusesPriorityComponent } from './components/handle-statuses-priority/handle-statuses-priority.component';
import { DaysHandleComponent } from './components/days-handle/days-handle.component';
import { HandleStatusesEmployeeBalanceComponent } from './components/handle-statuses-employee-balance/handle-statuses-employee-balance.component';
import { MyBalanceComponent } from './components/my-balance/my-balance.component';


@NgModule({
  declarations: [
    VacationsTasksComponent,
    AttendanceStatusClassificationsComponent,
    AttendanceStatusesComponent,
    HandleStatusesPriorityComponent,
    DaysHandleComponent,
    HandleStatusesEmployeeBalanceComponent,
    MyBalanceComponent
  ],
  imports: [
    CommonModule,
    VacarionAndTasksRoutingModule
  ]
})
export class VacarionAndTasksModule { }
