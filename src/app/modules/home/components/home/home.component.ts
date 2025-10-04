import { Component } from '@angular/core';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(
    public permissionsService: PermissionsService
  ) {}

  /**
   * Check if user has permission to view a specific menu item
   * @param menuId The menu item ID to check
   * @returns true if user has permission
   */
  hasPermission(menuId: number): boolean {
    return this.permissionsService.hasPermission(menuId);
  }

  /**
   * Check if user has permission for any of the child menu items
   * This is useful for parent menus that should be visible if any child has permission
   * @param menuIds Array of child menu IDs to check
   * @returns true if user has at least one permission
   */
  hasAnyChildPermission(menuIds: number[]): boolean {
    return this.permissionsService.hasAnyPermission(menuIds);
  }
}
