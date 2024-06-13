import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"ring-of-fire-bb3ce","appId":"1:429981241121:web:b657ce2b52596b5c9a7860","storageBucket":"ring-of-fire-bb3ce.appspot.com","apiKey":"AIzaSyBTC3WuYPPz8ws-0_k-rmADWuYCXw34tpc","authDomain":"ring-of-fire-bb3ce.firebaseapp.com","messagingSenderId":"429981241121"})), provideFirestore(() => getFirestore()), provideAnimationsAsync()]
};
