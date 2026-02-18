import { Routes } from '@angular/router';
import { StyleGuide } from './components/style-guide/style-guide/style-guide';
import { Login } from './components/auth/login/login';
import { Signup } from './components/auth/signup/signup';

export const routes: Routes = [
  {
    path: 'style-guide',
    component: StyleGuide,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'signup',
    component: Signup,
  },
];
