import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-basic-system-items',
  templateUrl: './basic-system-items.component.html',
  styleUrl: './basic-system-items.component.css'
})
export class BasicSystemItemsComponent {
  constructor(public permissionsService: PermissionsService) {}
  
  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
}
