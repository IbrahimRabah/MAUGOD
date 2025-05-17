import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrackingLocationsRoutingModule } from './tracking-locations-routing.module';
import { TrackingLocationsComponent } from './components/tracking-locations/tracking-locations.component';
import { LocationTrackingDetailsComponent } from './components/location-tracking-details/location-tracking-details.component';
import { LocationTrackingTransactionComponent } from './components/location-tracking-transaction/location-tracking-transaction.component';


@NgModule({
  declarations: [
    TrackingLocationsComponent,
    LocationTrackingDetailsComponent,
    LocationTrackingTransactionComponent
  ],
  imports: [
    CommonModule,
    TrackingLocationsRoutingModule
  ]
})
export class TrackingLocationsModule { }
