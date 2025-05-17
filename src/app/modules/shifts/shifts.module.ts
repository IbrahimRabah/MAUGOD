import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShiftsRoutingModule } from './shifts-routing.module';
import { ShiftsSectionComponent } from './components/shifts-section/shifts-section.component';
import { ShiftsComponent } from './components/shifts/shifts.component';
import { AutomaticSignComponent } from './components/automatic-sign/automatic-sign.component';
import { ShiftsAssignComponent } from './components/shifts-assign/shifts-assign.component';
import { MissingDaysWithNoShiftsComponent } from './components/missing-days-with-no-shifts/missing-days-with-no-shifts.component';
import { TimtranLockComponent } from './components/timtran-lock/timtran-lock.component';


@NgModule({
  declarations: [
    ShiftsSectionComponent,
    ShiftsComponent,
    AutomaticSignComponent,
    ShiftsAssignComponent,
    MissingDaysWithNoShiftsComponent,
    TimtranLockComponent
  ],
  imports: [
    CommonModule,
    ShiftsRoutingModule
  ]
})
export class ShiftsModule { }
