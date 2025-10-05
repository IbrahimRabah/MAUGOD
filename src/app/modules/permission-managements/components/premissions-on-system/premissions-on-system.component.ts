import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-premissions-on-system',
  templateUrl: './premissions-on-system.component.html',
  styleUrl: './premissions-on-system.component.css'
})
export class PremissionsOnSystemComponent {
  constructor(public permissionsService: PermissionsService) {}
  
  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
}
