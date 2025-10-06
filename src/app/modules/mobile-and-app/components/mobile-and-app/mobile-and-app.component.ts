import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-mobile-and-app',
  templateUrl: './mobile-and-app.component.html',
  styleUrl: './mobile-and-app.component.css'
})
export class MobileAndAppComponent {
  constructor(public permissionsService: PermissionsService) {}

  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
  
  hasAnyChildPermission(menuIds: number[]): boolean {
    return this.permissionsService.hasAnyPermission(menuIds);
  }
}
