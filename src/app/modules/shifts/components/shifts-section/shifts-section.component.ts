import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-shifts-section',
  templateUrl: './shifts-section.component.html',
  styleUrl: './shifts-section.component.css'
})
export class ShiftsSectionComponent {
  constructor(public permissionsService: PermissionsService) {}

  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }
}
