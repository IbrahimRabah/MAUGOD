import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MobileAndAppRoutingModule } from './mobile-and-app-routing.module';
import { MobileAndAppComponent } from './components/mobile-and-app/mobile-and-app.component';
import { MawjoodAppComponent } from './components/mawjood-app/mawjood-app.component';
import { SendAppQrCodeComponent } from './components/send-app-qr-code/send-app-qr-code.component';
import { AppDevicesComponent } from './components/app-devices/app-devices.component';
import { MobileSignLocationAssignComponent } from './components/mobile-sign-location-assign/mobile-sign-location-assign.component';
import { MobileSignTransactionComponent } from './components/mobile-sign-transaction/mobile-sign-transaction.component';
import { MobileSignLocationsComponent } from './components/mobile-sign-locations/mobile-sign-locations.component';


@NgModule({
  declarations: [
    MobileAndAppComponent,
    MawjoodAppComponent,
    SendAppQrCodeComponent,
    AppDevicesComponent,
    MobileSignLocationAssignComponent,
    MobileSignTransactionComponent,
    MobileSignLocationsComponent
  ],
  imports: [
    CommonModule,
    MobileAndAppRoutingModule
  ]
})
export class MobileAndAppModule { }
