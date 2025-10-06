import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-tracking-locations',
  templateUrl: './tracking-locations.component.html',
  styleUrl: './tracking-locations.component.css'
})
export class TrackingLocationsComponent {
  constructor(public permissionsService: PermissionsService) {}

  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
}
