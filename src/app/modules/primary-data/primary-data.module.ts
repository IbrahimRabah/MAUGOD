import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrimaryDataRoutingModule } from './primary-data-routing.module';
import { GeneralDataComponent } from './components/general-data/general-data.component';
import { MawjoodDataComponent } from './components/mawjood-data/mawjood-data.component';
import { BranchesComponent } from './components/branches/branches.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { NationalitiesComponent } from './components/nationalities/nationalities.component';
import { BanksComponent } from './components/banks/banks.component';
import { EmplyeesStatusesComponent } from './components/emplyees-statuses/emplyees-statuses.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { EmplyoeesDocumentsComponent } from './components/emplyoees-documents/emplyoees-documents.component';
import { PrimaryDataComponent } from './components/primary-data/primary-data.component';


@NgModule({
  declarations: [
    GeneralDataComponent,
    MawjoodDataComponent,
    BranchesComponent,
    DepartmentsComponent,
    EmployeesComponent,
    NationalitiesComponent,
    BanksComponent,
    EmplyeesStatusesComponent,
    JobsComponent,
    EmplyoeesDocumentsComponent,
    PrimaryDataComponent
  ],
  imports: [
    CommonModule,
    PrimaryDataRoutingModule
  ]
})
export class PrimaryDataModule { }
