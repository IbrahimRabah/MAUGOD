import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MawjoodAppRoutingModule } from './mawjood-app-routing.module';
import { MawjoodAppComponent } from './components/mawjood-app/mawjood-app.component';


@NgModule({
  declarations: [
    MawjoodAppComponent
  ],
  imports: [
    CommonModule,
    MawjoodAppRoutingModule
  ]
})
export class MawjoodAppModule { }
