import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp({ projectId: "dairy-management-20105", appId: "1:498789536818:web:9debd9469be5d35a34d82b", storageBucket: "dairy-management-20105.firebasestorage.app", apiKey: "AIzaSyBWOsOMZZ3mgYhBK1NFQ8Hup28O5nVsXuM", authDomain: "dairy-management-20105.firebaseapp.com", messagingSenderId: "498789536818", measurementId: "G-GSENGHRE73", })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase())
  ]
};