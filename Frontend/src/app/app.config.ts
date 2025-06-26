import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppInitializerService } from './core/services/app-initializer.service';
import { TokenInterceptor } from './core/interceptors/token.interceptor';

export function initializeApp(appInitializer: AppInitializerService) {
  return async () => {
    try {
      await appInitializer.initializeApp();
    } catch (error) {
      console.error("Erreur pendant l'initialisation", error);
      throw error;
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES),
    provideHttpClient(withInterceptors([TokenInterceptor])),
    AppInitializerService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppInitializerService],
      multi: true,
    },
  ],
};
