import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Add JWT token to requests (except for auth endpoints)
  const token = authService.getToken();
  const isAuthEndpoint = req.url.includes('/auth/');
  
  console.log('🔍 JWT Interceptor Debug:', {
    url: req.url,
    hasToken: !!token,
    isAuthEndpoint,
    tokenLength: token?.length || 0
  });
  
  let request = req;
  
  if (token && !isAuthEndpoint) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ JWT token added to request');
  } else {
    console.log('❌ JWT token NOT added:', { hasToken: !!token, isAuthEndpoint });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('🚨 HTTP Error in JWT Interceptor:', {
        status: error.status,
        url: req.url,
        error: error.message
      });
      
      // Handle 401 Unauthorized responses
      if (error.status === 401 && !isAuthEndpoint) {
        console.warn('JWT token expired or invalid, logging out...');
        authService.logout();
      }
      
      return throwError(() => error);
    })
  );
};