import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuItem } from '../models/account';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private menuListSubject = new BehaviorSubject<MenuItem[]>([]);
  private permissionIdsSubject = new BehaviorSubject<Set<number>>(new Set());

  public menuList$ = this.menuListSubject.asObservable();
  public permissionIds$ = this.permissionIdsSubject.asObservable();

  constructor() {
    // Load permissions from localStorage on service initialization
    this.loadPermissionsFromStorage();
  }

  /**
   * Set the user's menu list and extract permission IDs
   * @param menuList Array of menu items from login response
   */
  setMenuPermissions(menuList: MenuItem[]): void {
    this.menuListSubject.next(menuList);
    
    // Extract all IDs for quick permission checking
    const permissionIds = new Set(menuList.map(item => item.id));
    this.permissionIdsSubject.next(permissionIds);
    
    // Store in localStorage for persistence
    localStorage.setItem('userPermissions', JSON.stringify(menuList));
  }

  /**
   * Check if user has permission to access a specific menu item
   * @param menuId The menu item ID to check
   * @returns true if user has permission, false otherwise
   */
  hasPermission(menuId: number): boolean {
    const currentPermissions = this.permissionIdsSubject.value;
    return currentPermissions.has(menuId);
  }

  /**
   * Get all permission IDs as an array
   * @returns Array of permission IDs
   */
  getPermissionIds(): number[] {
    return Array.from(this.permissionIdsSubject.value);
  }

  /**
   * Get the current menu list
   * @returns Current menu list
   */
  getMenuList(): MenuItem[] {
    return this.menuListSubject.value;
  }

  /**
   * Check if user has permission for any of the provided menu IDs
   * This is useful for parent menus that should be visible if any child has permission
   * @param menuIds Array of menu IDs to check
   * @returns true if user has at least one permission
   */
  hasAnyPermission(menuIds: number[]): boolean {
    const currentPermissions = this.permissionIdsSubject.value;
    return menuIds.some(id => currentPermissions.has(id));
  }

  /**
   * Clear all permissions (used on logout)
   */
  clearPermissions(): void {
    this.menuListSubject.next([]);
    this.permissionIdsSubject.next(new Set());
    localStorage.removeItem('userPermissions');
  }

  /**
   * Load permissions from localStorage
   * This is called on service initialization to restore permissions after page refresh
   */
  private loadPermissionsFromStorage(): void {
    const storedPermissions = localStorage.getItem('userPermissions');
    if (storedPermissions) {
      try {
        const menuList: MenuItem[] = JSON.parse(storedPermissions);
        this.setMenuPermissions(menuList);
      } catch (error) {
        console.error('Error parsing stored permissions:', error);
        localStorage.removeItem('userPermissions');
      }
    }
  }
}