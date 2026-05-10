import { Routes } from '@angular/router';
import { StyleGuide } from './components/style-guide/style-guide/style-guide';
import { Login } from './components/auth/login/login';
import { Signup } from './components/auth/signup/signup';
import { ForgotPassword } from './components/auth/forgot-password/forgot-password';
import { OwnerDashboard } from './components/dashboards/owner-dashboard/owner-dashboard';
import { CustomerDashboard } from './components/dashboards/customer-dashboard/customer-dashboard';
import { ManagerDashboard } from './components/dashboards/manager-dashboard/manager-dashboard';
import { AdminDashboard } from './components/dashboards/admin-dashboard/admin-dashboard';

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
  {
    path: 'forgot-password',
    component: ForgotPassword,
  },
  {
    path: 'dashboard',
    children: [
      {
        path: 'admin',
        component: AdminDashboard,
      },
      {
        path: 'owner',
        component: OwnerDashboard,
      },
      {
        path: 'manager',
        component: ManagerDashboard,
      },
      {
        path: 'customer',
        component: CustomerDashboard,
      }
    ]
  }
];
