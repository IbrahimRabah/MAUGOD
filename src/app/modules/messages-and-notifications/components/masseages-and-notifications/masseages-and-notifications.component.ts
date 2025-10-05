import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-masseages-and-notifications',
  templateUrl: './masseages-and-notifications.component.html',
  styleUrl: './masseages-and-notifications.component.css'
})
export class MasseagesAndNotificationsComponent {
  
  constructor(public permissionsService: PermissionsService) {}
    hasPermission(menuId: number): boolean {
      return this.permissionsService.hasPermission(menuId);
  }
}
