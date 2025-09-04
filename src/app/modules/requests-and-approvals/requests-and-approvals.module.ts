import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// PrimeNG Components
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';

import { RequestsAndApprovalsRoutingModule } from './requests-and-approvals-routing.module';
import { RequestsAndApprovalsComponent } from './components/requests-and-approvals/requests-and-approvals.component';
import { StepsToApproveChangingTimeComponent } from './components/steps-to-approve-changing-time/steps-to-approve-changing-time.component';
import { AttantanceTimeChangeRequestComponent } from './components/attantance-time-change-request/attantance-time-change-request.component';
import { PostRequestComponent } from './components/post-request/post-request.component';
import { RequestApprovalRouteComponent } from './components/request-approval-route/request-approval-route.component';
import { RequestApprovalVacationsComponent } from './components/request-approval-vacations/request-approval-vacations.component';
import { DeleteCompletedRequestComponent } from './components/delete-completed-request/delete-completed-request.component';
import { RequestDetailsModalComponent } from './components/request-details-modal/request-details-modal.component';
import { AttachmentsModalComponent } from './components/attachments-modal/attachments-modal.component';
import { CreatePostRequestModalComponent } from './components/create-post-request-modal/create-post-request-modal.component';
import { PostRequestAttachmentsModalComponent } from './components/post-request-attachments-modal/post-request-attachments-modal.component';
import { CreateRequestApprovalRouteModalComponent } from './components/create-request-approval-route-modal/create-request-approval-route-modal.component';


@NgModule({
  declarations: [
    RequestsAndApprovalsComponent,
    StepsToApproveChangingTimeComponent,
    AttantanceTimeChangeRequestComponent,
    PostRequestComponent,
    RequestApprovalRouteComponent,
    RequestApprovalVacationsComponent,
    DeleteCompletedRequestComponent,
    RequestDetailsModalComponent,
    AttachmentsModalComponent,
    CreatePostRequestModalComponent,
    PostRequestAttachmentsModalComponent,
    CreateRequestApprovalRouteModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    ToastModule,
    ConfirmDialogModule,
    DropdownModule,
    RequestsAndApprovalsRoutingModule
  ]
})
export class RequestsAndApprovalsModule { }
