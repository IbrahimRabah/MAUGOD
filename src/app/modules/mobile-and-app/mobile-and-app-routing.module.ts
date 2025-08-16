import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MobileAndAppComponent } from './components/mobile-and-app/mobile-and-app.component';
import { MawjoodAppComponent } from './components/mawjood-app/mawjood-app.component';
import { SendAppQrCodeComponent } from './components/send-app-qr-code/send-app-qr-code.component';
import { MobileSignLocationAssignComponent } from './components/mobile-sign-location-assign/mobile-sign-location-assign.component';
import { MobileSignTransactionComponent } from './components/mobile-sign-transaction/mobile-sign-transaction.component';
import { MobileSignLocationsComponent } from './components/mobile-sign-locations/mobile-sign-locations.component';
import { AppDevicesComponent } from './components/app-devices/app-devices.component';

const routes: Routes = [
  {
    path: '',
    component: MobileAndAppComponent
  },
  {
    path: 'mawjood-app',
    component: MawjoodAppComponent
  },
  {
    path: 'send-app-qr-code',
    component: SendAppQrCodeComponent
  },
  {
    path: 'app-devices',
    component: AppDevicesComponent
  },
  {
    path: 'mobile-sign-location-assign',
    component: MobileSignLocationAssignComponent
  },
  {
    path: 'mobile-sign-locations',
    component: MobileSignLocationsComponent
  },
  {
    path: 'mobile-sign-transaction',
    component: MobileSignTransactionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MobileAndAppRoutingModule { }
