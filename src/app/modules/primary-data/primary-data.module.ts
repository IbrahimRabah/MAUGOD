import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { PrimaryDataRoutingModule } from './primary-data-routing.module';
import { GeneralDataComponent } from './components/general-data/general-data.component';
import { MawjoodDataComponent } from './components/mawjood-data/mawjood-data.component';
import { EmployeeStatusesComponent } from './components/employee-statuses/employee-statuses.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { EmployeeDocumentsComponent } from './components/employee-documents/employee-documents.component';
import { PrimaryDataComponent } from './components/primary-data/primary-data.component';
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


@NgModule({
  declarations: [
    GeneralDataComponent,
    MawjoodDataComponent,
    EmployeeStatusesComponent,
    JobsComponent,
    EmployeeDocumentsComponent,
    PrimaryDataComponent,
    CtsDataComponent,
    CommitteesDataComponent,
    ActionComponent,
    PositionComponent,
    MyListComponent,
    DocumentTemplateComponent,
    DeliveryModeComponent,
    DocumentTypeComponent,
    KeywordsComponent,
    PriorityLevelComponent,
    SecurityLevelComponent,
    SubjectClassComponent,
    DocumentColorComponent,
    TransactionStatusComponent,
    UrgencyLevelComponent,
    ApprovalRoutesComponent,
    AllDataComponent,
    ParallelDocumentComponent,
    SecurityPolicyComponent,
    MasarApplicationComponent,
    CommitteesComponent,
    CommitteeMembersComponent,
    CommitteeInvitationsComponent,
    CommitteeRouteComponent,
    CommitteeSubjectClassesComponent,
    VotingTypesComponent,
    MeetingAndSubjectsComponent,
    CitiesComponent,
    OrganizationComponent,
    ProvinceComponent
  ],
  imports: [
    CommonModule,
    PrimaryDataRoutingModule,
    TranslateModule
  ]
})
export class PrimaryDataModule { }
