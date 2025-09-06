import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-requests-and-approvals',
  templateUrl: './requests-and-approvals.component.html',
  styleUrls: ['./requests-and-approvals.component.css']
})
export class RequestsAndApprovalsComponent {
  constructor(public translate: TranslateService) {}
}
