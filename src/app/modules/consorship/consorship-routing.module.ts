import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorsorshipComponent } from './components/corsorship/corsorship.component';
import { CensorshipTourAvaibaleComponent } from './components/censorship-tour-avaibale/censorship-tour-avaibale.component';
import { CensorshipTourUnavailableComponent } from './components/censorship-tour-unavailable/censorship-tour-unavailable.component';
import { AlarmComponent } from './components/alarm/alarm.component';

const routes: Routes = [
  { path: '', redirectTo: 'consorship', pathMatch: 'full' },
  { path: 'consorship', component: CorsorshipComponent },
  { path: 'tour-available', component: CensorshipTourAvaibaleComponent },
  { path: 'tour-unavailable', component: CensorshipTourUnavailableComponent },
  { path: 'alarms', component: AlarmComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsorshipRoutingModule { }
