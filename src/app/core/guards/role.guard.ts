import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data?.['role'] as string;

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRole && authService.getRole() !== expectedRole) {
    // Redirect to appropriate dashboard based on actual role
    if (authService.isAdmin()) {
      router.navigate(['/admin/dashboard']);
    } else if (authService.isCandidate()) {
      router.navigate(['/candidate/dashboard']);
    } else {
      router.navigate(['/']);
    }
    return false;
  }

  return true;
};
