import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ConsorshipRoutingModule } from './consorship-routing.module';
import { CorsorshipComponent } from './components/corsorship/corsorship.component';
import { CensorshipTourAvaibaleComponent } from './components/censorship-tour-avaibale/censorship-tour-avaibale.component';
import { CensorshipTourUnavailableComponent } from './components/censorship-tour-unavailable/censorship-tour-unavailable.component';
import { AlarmComponent } from './components/alarm/alarm.component';


@NgModule({
  declarations: [
    CorsorshipComponent,
    CensorshipTourAvaibaleComponent,
    CensorshipTourUnavailableComponent,
    AlarmComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    ConsorshipRoutingModule
  ]
})
export class ConsorshipModule { }
