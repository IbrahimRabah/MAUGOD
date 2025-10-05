import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-audit-and-tracing',
  templateUrl: './audit-and-tracing.component.html',
  styleUrl: './audit-and-tracing.component.css'
})
export class AuditAndTracingComponent {
  constructor(public permissionsService: PermissionsService) {}
  
  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
}
