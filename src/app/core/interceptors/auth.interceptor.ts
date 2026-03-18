import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const userData = localStorage.getItem('auth_user');

  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user?.token) {
        req = req.clone({
          setHeaders: { Authorization: `Bearer ${user.token}` },
        });
      }
    } catch {
      // Invalid stored data
    }
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem('auth_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
