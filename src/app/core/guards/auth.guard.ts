import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from '../../modules/authentication/services/authentication.service';
import { PermissionsService } from '../services/permissions.service';
import { routePermissionMap } from './route-permission-map';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  const permissionsService = inject(PermissionsService);

  var isAuthoenticated = authService.isAuthenticated()
  if (!isAuthoenticated) {
    router.navigate(['/auth/login']);
    return false;  
  } 

  const currentUrl = state.url.split('?')[0]; 
  const matchedKey = Object.keys(routePermissionMap)
    .find(path => currentUrl.startsWith(path));
  const permissionIds = matchedKey ? routePermissionMap[matchedKey] : [];

  let hasPermission = false;
  if (Array.isArray(permissionIds) && permissionIds.length > 0) {
    hasPermission = permissionIds.some(id => permissionsService.hasPermission(id));
  }

  
  if (!hasPermission) {
    router.navigate(['/home']);
    return false;  
  }

  return hasPermission;
};

