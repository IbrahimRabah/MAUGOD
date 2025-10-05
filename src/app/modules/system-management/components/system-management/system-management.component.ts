import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-system-management',
  templateUrl: './system-management.component.html',
  styleUrl: './system-management.component.css'
})
export class SystemManagementComponent {
  
  constructor(public permissionsService: PermissionsService) {}

  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
}
