import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { PermissionsService } from '../../../core/services/permissions.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  openSubmenus: { [key: string]: boolean } = {};

  constructor(
    public sidebarService: SidebarService,
    public permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.sidebarService.isExpanded$.subscribe(isExpanded => {
      console.log('Sidebar expanded state:', isExpanded);
    });
  }

  toggleSubmenu(menuId: string) {
    this.openSubmenus[menuId] = !this.openSubmenus[menuId];
  }

  isSubmenuOpen(menuId: string): boolean {
    return this.openSubmenus[menuId] || false;
  }

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
