import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalariesComponent } from './components/salaries/salaries.component';
import { SalaryAddDeductsAssignComponent } from './components/salary-add-deducts-assign/salary-add-deducts-assign.component';
import { SalaryAddOnsDeductsComponent } from './components/salary-add-ons-deducts/salary-add-ons-deducts.component';
import { SalariesCalculationComponent } from './components/salaries-calculation/salaries-calculation.component';
import { MySalaryComponent } from './components/my-salary/my-salary.component';
import { SalariesDetailsComponent } from './components/salaries-details/salaries-details.component';
import { DataTransferFormComponent } from './components/data-transfer-form/data-transfer-form.component';

const routes: Routes = [
  {
    path: '',
    component: SalariesComponent
  },
  {
    path: 'salary-add-deducts',
    component: SalaryAddDeductsAssignComponent
  },
  {
    path: 'salary-add-ons-deducts',
    component: SalaryAddOnsDeductsComponent
  },
  {
    path: 'salaries-calculation',
    component: SalariesCalculationComponent
  },
  {
    path: 'my-salary',
    component: MySalaryComponent
  },
  {
    path: 'salaries-details',
    component: SalariesDetailsComponent
  },
  {
    path: 'data-transfer',
    component: DataTransferFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalariesRoutingModule { }
