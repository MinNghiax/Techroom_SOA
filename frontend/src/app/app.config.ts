import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Thêm withInterceptors
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor'; // Import interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // SỬA DÒNG NÀY:
    
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};