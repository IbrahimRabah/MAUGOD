import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-mawjood-data',
  templateUrl: './mawjood-data.component.html',
  styleUrl: './mawjood-data.component.css'
})
export class MawjoodDataComponent {
  constructor(public permissionsService: PermissionsService) {}

  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
}
