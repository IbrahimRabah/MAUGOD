import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-cts-data',
  templateUrl: './cts-data.component.html',
  styleUrl: './cts-data.component.css'
})
export class CtsDataComponent {
  /**
   *
   */
  constructor(public permissionsService: PermissionsService) {}

  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
}
