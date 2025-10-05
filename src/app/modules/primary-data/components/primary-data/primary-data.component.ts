import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-primary-data',
  templateUrl: './primary-data.component.html',
  styleUrls: ['./primary-data.component.css']
})
export class PrimaryDataComponent {
  constructor(public translate: TranslateService, public permissionsService: PermissionsService) {}

  hasAnyChildPermission(menuIds: number[]): boolean {
    return this.permissionsService.hasAnyPermission(menuIds);
  }
}
