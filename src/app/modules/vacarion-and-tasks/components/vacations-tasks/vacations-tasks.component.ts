import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-vacations-tasks',
  templateUrl: './vacations-tasks.component.html',
  styleUrl: './vacations-tasks.component.css'
})
export class VacationsTasksComponent {

  constructor(public permissionsService: PermissionsService) {}
  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
}
