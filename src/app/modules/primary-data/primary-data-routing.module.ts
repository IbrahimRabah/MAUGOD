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
import { CtsDataComponent } from './components/cts-data/cts-data.component';
import { CommitteesDataComponent } from './components/committees-data/committees-data.component';
import { ActionComponent } from './components/action/action.component';
import { PositionComponent } from './components/position/position.component';
import { MyListComponent } from './components/my-list/my-list.component';
import { DocumentTemplateComponent } from './components/document-template/document-template.component';
import { DeliveryModeComponent } from './components/delivery-mode/delivery-mode.component';
import { DocumentTypeComponent } from './components/document-type/document-type.component';
import { KeywordsComponent } from './components/keywords/keywords.component';
import { PriorityLevelComponent } from './components/priority-level/priority-level.component';
import { SecurityLevelComponent } from './components/security-level/security-level.component';
import { SubjectClassComponent } from './components/subject-class/subject-class.component';
import { DocumentColorComponent } from './components/document-color/document-color.component';
import { TransactionStatusComponent } from './components/transaction-status/transaction-status.component';
import { UrgencyLevelComponent } from './components/urgency-level/urgency-level.component';
import { ApprovalRoutesComponent } from './components/approval-routes/approval-routes.component';
import { AllDataComponent } from './components/all-data/all-data.component';
import { ParallelDocumentComponent } from './components/parallel-document/parallel-document.component';
import { SecurityPolicyComponent } from './components/security-policy/security-policy.component';
import { MasarApplicationComponent } from './components/masar-application/masar-application.component';
import { CommitteesComponent } from './components/committees/committees.component';
import { CommitteeMembersComponent } from './components/committee-members/committee-members.component';
import { CommitteeInvitationsComponent } from './components/committee-invitations/committee-invitations.component';
import { CommitteeRouteComponent } from './components/committee-route/committee-route.component';
import { CommitteeSubjectClassesComponent } from './components/committee-subject-classes/committee-subject-classes.component';
import { VotingTypesComponent } from './components/voting-types/voting-types.component';
import { MeetingAndSubjectsComponent } from './components/meeting-and-subjects/meeting-and-subjects.component';
import { CitiesComponent } from './components/cities/cities.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { ProvinceComponent } from './components/province/province.component';
import { EmployeeStatusesComponent } from './components/employee-statuses/employee-statuses.component';
import { EmployeeDocumentsComponent } from './components/employee-documents/employee-documents.component';

const routes: Routes = [
  { path: '', component: PrimaryDataComponent },
  { path: 'general-data', component: GeneralDataComponent },
  { 
    path: 'mawjood-data', 
    component: MawjoodDataComponent,
    children: [
      { path: 'employee-statuses', component: EmployeeStatusesComponent },
      { path: 'jobs', component: JobsComponent },
      { path: 'employee-documents', component: EmployeeDocumentsComponent }
    ]
  },
  { path: 'branches', component: BranchesComponent },
  { path: 'departments', component: DepartmentsComponent },
  { path: 'banks', component: BanksComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'nationalities', component: NationalitiesComponent },
  { path: 'employees-statuses', component: EmplyeesStatusesComponent },
  { path: 'jobs', component: JobsComponent },
  { path: 'employees-documents', component: EmplyoeesDocumentsComponent },
  { path: 'cts-data', component: CtsDataComponent },
  { path: 'committees-data', component: CommitteesDataComponent },
  { path: 'action', component: ActionComponent },
  { path: 'position', component: PositionComponent },
  { path: 'my-list', component: MyListComponent },
  { path: 'document-template', component: DocumentTemplateComponent },
  { path: 'delivery-mode', component: DeliveryModeComponent },
  { path: 'document-type', component: DocumentTypeComponent },
  { path: 'keywords', component: KeywordsComponent },
  { path: 'priority-level', component: PriorityLevelComponent },
  { path: 'security-level', component: SecurityLevelComponent },
  { path: 'subject-class', component: SubjectClassComponent },
  { path: 'document-color', component: DocumentColorComponent },
  { path: 'transaction-status', component: TransactionStatusComponent },
  { path: 'urgency-level', component: UrgencyLevelComponent },
  { path: 'approval-routes', component: ApprovalRoutesComponent },
  { path: 'all-data', component: AllDataComponent },
  { path: 'parallel-document', component: ParallelDocumentComponent },
  { path: 'security-policy', component: SecurityPolicyComponent },
  { path: 'masar-application', component: MasarApplicationComponent },
  { path: 'committees', component: CommitteesComponent },
  { path: 'committee-members', component: CommitteeMembersComponent },
  { path: 'committee-invitations', component: CommitteeInvitationsComponent },
  { path: 'committee-route', component: CommitteeRouteComponent },
  { path: 'committee-subject-classes', component: CommitteeSubjectClassesComponent },
  { path: 'voting-types', component: VotingTypesComponent },
  { path: 'meeting-and-subjects', component: MeetingAndSubjectsComponent },
  { path: 'cities',component: CitiesComponent},
  { path: 'organization',component: OrganizationComponent},
  { path: 'province',component: ProvinceComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrimaryDataRoutingModule { }
