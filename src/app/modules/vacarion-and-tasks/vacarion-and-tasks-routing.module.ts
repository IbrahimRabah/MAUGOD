import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VacationsTasksComponent } from './components/vacations-tasks/vacations-tasks.component';
import { AttendanceStatusClassificationsComponent } from './components/attendance-status-classifications/attendance-status-classifications.component';
import { AttendanceStatusesComponent } from './components/attendance-statuses/attendance-statuses.component';
import { HandleStatusesPriorityComponent } from './components/handle-statuses-priority/handle-statuses-priority.component';
import { DaysHandleComponent } from './components/days-handle/days-handle.component';
import { HandleStatusesEmployeeBalanceComponent } from './components/handle-statuses-employee-balance/handle-statuses-employee-balance.component';
import { MyBalanceComponent } from './components/my-balance/my-balance.component';

const routes: Routes = [
  {path: '', component: VacationsTasksComponent , pathMatch: 'full'},
  { path: 'vacation-tasks', component: VacationsTasksComponent },
  { path: 'attendance-status-classifications', component: AttendanceStatusClassificationsComponent },
  { path: 'attendance-statuses', component: AttendanceStatusesComponent },
  { path: 'handle-statuses-priority', component: HandleStatusesPriorityComponent },
  { path: 'days-handle', component: DaysHandleComponent },
  { path: 'handle-statuses-employee-balance', component: HandleStatusesEmployeeBalanceComponent },
  { path: 'my-balance', component: MyBalanceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VacarionAndTasksRoutingModule { }
