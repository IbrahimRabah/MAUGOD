import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestsAndApprovalsComponent } from './components/requests-and-approvals/requests-and-approvals.component';
import { StepsToApproveChangingTimeComponent } from './components/steps-to-approve-changing-time/steps-to-approve-changing-time.component';
import { AttantanceTimeChangeRequestComponent } from './components/attantance-time-change-request/attantance-time-change-request.component';
import { PostRequestComponent } from './components/post-request/post-request.component';
import { RequestApprovalRouteComponent } from './components/request-approval-route/request-approval-route.component';
import { RequestApprovalVacationsComponent } from './components/request-approval-vacations/request-approval-vacations.component';
import { DeleteCompletedRequestComponent } from './components/delete-completed-request/delete-completed-request.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'requests-and-approvals',
    pathMatch: 'full'
  },
  {
    path: 'requests-and-approvals',
    component: RequestsAndApprovalsComponent,
  },

  {
    path: 'steps-to-approve-changing-time',
    component: StepsToApproveChangingTimeComponent
  },
  {
    path: 'attendance-time-change-request',
    component: AttantanceTimeChangeRequestComponent
  },
  {
    path: 'post-request',
    component: PostRequestComponent
  },
  {
    path: 'request-approval-route',
    component: RequestApprovalRouteComponent
  },
  {
    path: 'request-approval-vacations',
    component: RequestApprovalVacationsComponent
  },
  {
    path: 'delete-completed-request',
    component: DeleteCompletedRequestComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestsAndApprovalsRoutingModule { }
