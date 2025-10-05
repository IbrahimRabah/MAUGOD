import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-premissions-manaagement',
  templateUrl: './premissions-manaagement.component.html',
  styleUrl: './premissions-manaagement.component.css'
})
export class PremissionsManaagementComponent {
  
  constructor(public permissionsService: PermissionsService) {}
  
  hasAnyChildPermission(menuIds: number[]): boolean {
    return this.permissionsService.hasAnyPermission(menuIds);
  }
}
