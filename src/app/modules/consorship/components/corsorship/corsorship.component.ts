import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-corsorship',
  templateUrl: './corsorship.component.html',
  styleUrl: './corsorship.component.css'
})
export class CorsorshipComponent {
  constructor(public permissionsService: PermissionsService) {}

  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
}
