import { Routes } from '@angular/router';
import { StyleGuide } from './components/style-guide/style-guide/style-guide';
import { Login } from './components/auth/login/login';
import { Signup } from './components/auth/signup/signup';
import { ForgotPassword } from './components/auth/forgot-password/forgot-password';
import { OwnerDashboard } from './components/dashboards/owner-dashboard/owner-dashboard';
import { CustomerDashboard } from './components/dashboards/customer-dashboard/customer-dashboard';
import { ManagerDashboard } from './components/dashboards/manager-dashboard/manager-dashboard';
import { AdminDashboard } from './components/dashboards/admin-dashboard/admin-dashboard';
import { permissionGuard } from './guards/permission/permission-guard';
import { UserType } from './types/enums/auth';
import { NotFound } from './components/errors/not-found/not-found';
import { PermissionDeny } from './components/errors/permission-deny/permission-deny';
import { authRedirectionGuard } from './guards/auth-redirection/auth-redirection-guard';
import { Profile } from './components/profile/profile/profile';

export const routes: Routes = [
  {
    path: 'style-guide',
    component: StyleGuide,
  },
  {
    path: 'login',
    component: Login,
    canActivate: [authRedirectionGuard],
  },
  {
    path: 'signup',
    component: Signup,
    canActivate: [authRedirectionGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPassword,
    canActivate: [authRedirectionGuard],
  },
  {
    path: 'dashboard',
    children: [
      {
        path: 'admin',
        component: AdminDashboard,
        canActivate: [permissionGuard],
        data: {
          requiredPermission: [UserType.ADMIN],
        },
      },
      {
        path: 'owner',
        component: OwnerDashboard,
        canActivate: [permissionGuard],
        data: {
          requiredPermission: [UserType.OWNER],
        },
      },
      {
        path: 'manager',
        component: ManagerDashboard,
        canActivate: [permissionGuard],
        data: {
          requiredPermission: [UserType.MANAGER],
        },
      },
      {
        path: 'customer',
        component: CustomerDashboard,
        canActivate: [permissionGuard],
        data: {
          requiredPermission: [UserType.CUSTOMER],
        },
      },
    ],
    data: {
      showNavbar: true,
      showFooter: true,
    },
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [permissionGuard],
    data: {
      requiredPermission: [UserType.ADMIN, UserType.OWNER, UserType.MANAGER, UserType.CUSTOMER],
      showNavbar: true,
      showFooter: true,
    },
  },
  {
    path: 'error',
    children: [
      {
        path: '403',
        component: PermissionDeny,
      },
      {
        path: '404',
        component: NotFound,
      },
    ],
    data: {
      showNavbar: true,
      showFooter: true,
    },
  },
  {
    path: '**',
    component: NotFound,
    data: {
      showNavbar: true,
      showFooter: true,
    },
  },
];
