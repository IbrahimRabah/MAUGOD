import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShiftsSectionComponent } from './components/shifts-section/shifts-section.component';
import { ShiftsComponent } from './components/shifts/shifts.component';
import { AutomaticSignComponent } from './components/automatic-sign/automatic-sign.component';
import { ShiftsAssignComponent } from './components/shifts-assign/shifts-assign.component';
import { MissingDaysWithNoShiftsComponent } from './components/missing-days-with-no-shifts/missing-days-with-no-shifts.component';
import { TimtranLockComponent } from './components/timtran-lock/timtran-lock.component';

const routes: Routes = [
  { path: '', component: ShiftsSectionComponent },
  { path: 'shifts', component: ShiftsComponent },
  { path: 'automatic-sign', component: AutomaticSignComponent },
  { path: 'shifts-assign', component: ShiftsAssignComponent },
  { path: 'missing-days', component: MissingDaysWithNoShiftsComponent },
  { path: 'timtran-lock', component: TimtranLockComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShiftsRoutingModule { }
