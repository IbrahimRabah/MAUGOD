import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../../modules/authentication/services/authentication.service';

// Reverse guard: prevents authenticated users from accessing auth pages
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  } else {
    console.log('Already authenticated - redirecting to home');
    router.navigate(['/home']);
    return false;
  }
};
