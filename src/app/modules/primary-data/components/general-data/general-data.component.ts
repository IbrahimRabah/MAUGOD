import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-general-data',
  templateUrl: './general-data.component.html',
  styleUrl: './general-data.component.css'
})
export class GeneralDataComponent {

  constructor(public permissionsService: PermissionsService) {}

  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
}
