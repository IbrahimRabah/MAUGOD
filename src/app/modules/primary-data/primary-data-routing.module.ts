import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrimaryDataComponent } from './components/primary-data/primary-data.component';
import { GeneralDataComponent } from './components/general-data/general-data.component';
import { MawjoodDataComponent } from './components/mawjood-data/mawjood-data.component';
import { BranchesComponent } from './components/branches/branches.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { NationalitiesComponent } from './components/nationalities/nationalities.component';
import { EmplyeesStatusesComponent } from './components/emplyees-statuses/emplyees-statuses.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { EmplyoeesDocumentsComponent } from './components/emplyoees-documents/emplyoees-documents.component';
import { BanksComponent } from './components/banks/banks.component';

const routes: Routes = [
  { path: '', component: PrimaryDataComponent },
  { path: 'general-data', component: GeneralDataComponent },
  { path: 'mawjood-data', component: MawjoodDataComponent },
  { path: 'branches', component: BranchesComponent },
  { path: 'departments', component: DepartmentsComponent },
  { path: 'banks', component: BanksComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'nationalities', component: NationalitiesComponent },
  { path: 'employees-statuses', component: EmplyeesStatusesComponent },
  { path: 'jobs', component: JobsComponent },
  { path: 'employees-documents', component: EmplyoeesDocumentsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrimaryDataRoutingModule { }
