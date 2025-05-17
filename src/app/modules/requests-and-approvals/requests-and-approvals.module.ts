import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestsAndApprovalsRoutingModule } from './requests-and-approvals-routing.module';
import { RequestsAndApprovalsComponent } from './components/requests-and-approvals/requests-and-approvals.component';
import { StepsToApproveChangingTimeComponent } from './components/steps-to-approve-changing-time/steps-to-approve-changing-time.component';
import { AttantanceTimeChangeRequestComponent } from './components/attantance-time-change-request/attantance-time-change-request.component';
import { PostRequestComponent } from './components/post-request/post-request.component';
import { RequestApprovalRouteComponent } from './components/request-approval-route/request-approval-route.component';
import { RequestApprovalVacationsComponent } from './components/request-approval-vacations/request-approval-vacations.component';
import { DeleteCompletedRequestComponent } from './components/delete-completed-request/delete-completed-request.component';


@NgModule({
  declarations: [
    RequestsAndApprovalsComponent,
    StepsToApproveChangingTimeComponent,
    AttantanceTimeChangeRequestComponent,
    PostRequestComponent,
    RequestApprovalRouteComponent,
    RequestApprovalVacationsComponent,
    DeleteCompletedRequestComponent
  ],
  imports: [
    CommonModule,
    RequestsAndApprovalsRoutingModule
  ]
})
export class RequestsAndApprovalsModule { }
