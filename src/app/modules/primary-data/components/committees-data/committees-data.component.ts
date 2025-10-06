import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-committees-data',
  templateUrl: './committees-data.component.html',
  styleUrls: ['./committees-data.component.css']
})
export class CommitteesDataComponent {
  constructor(public permissionsService: PermissionsService) {}

  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
}
