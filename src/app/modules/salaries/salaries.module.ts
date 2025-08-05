import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// PrimeNG Modules
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { SalariesRoutingModule } from './salaries-routing.module';
import { SalariesComponent } from './components/salaries/salaries.component';
import { SalaryAddDeductsAssignComponent } from './components/salary-add-deducts-assign/salary-add-deducts-assign.component';
import { SalaryAddOnsDeductsComponent } from './components/salary-add-ons-deducts/salary-add-ons-deducts.component';
import { SalariesCalculationComponent } from './components/salaries-calculation/salaries-calculation.component';
import { MySalaryComponent } from './components/my-salary/my-salary.component';
import { SalariesDetailsComponent } from './components/salaries-details/salaries-details.component';


@NgModule({
  declarations: [
    SalariesComponent,
    SalaryAddDeductsAssignComponent,
    SalaryAddOnsDeductsComponent,
    SalariesCalculationComponent,
    MySalaryComponent,
    SalariesDetailsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    ToastModule,
    ConfirmDialogModule,
    SalariesRoutingModule
  ]
})
export class SalariesModule { }
