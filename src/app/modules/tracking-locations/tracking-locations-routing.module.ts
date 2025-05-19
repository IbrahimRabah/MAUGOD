import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrackingLocationsComponent } from './components/tracking-locations/tracking-locations.component';
import { LocationTrackingDetailsComponent } from './components/location-tracking-details/location-tracking-details.component';
import { LocationTrackingTransactionComponent } from './components/location-tracking-transaction/location-tracking-transaction.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tracking-locations',
    pathMatch: 'full'
  },
  {
    path: 'tracking-locations',
    component: TrackingLocationsComponent,
  },
  {
    path: 'location-tracking-details',
    component: LocationTrackingDetailsComponent
  },
  {
    path: 'location-tracking-transactions',
    component: LocationTrackingTransactionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrackingLocationsRoutingModule { }
