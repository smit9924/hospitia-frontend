import { Routes } from '@angular/router';
import { StyleGuide } from './components/style-guide/style-guide/style-guide';
import { Login } from './components/auth/login/login';
import { Signup } from './components/auth/signup/signup';
import { ForgotPassword } from './components/auth/forgot-password/forgot-password';
import { ResetPassword } from './components/auth/reset-password/reset-password';
import { VerifyEmail } from './components/auth/verify-email/verify-email';
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
import { LandingPage } from './components/landing-page/landing-page';
import { SettingPage } from './components/settings/setting-page/setting-page';
import { ChangePassword } from './components/settings/change-password/change-password';
import { DisplayAndAccessibility } from './components/settings/display-and-accessibility/display-and-accessibility';
import { PrivacyAndSecurity } from './components/settings/privacy-and-security/privacy-and-security';

export const routes: Routes = [
  {
    path: 'style-guide',
    component: StyleGuide,
  },
  {
    path: '',
    component: LandingPage,
    data: {
      showNavbar: true,
      showFooter: true,
    },
  },
  {
    path: 'auth',
    children: [
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
        path: 'reset-password',
        component: ResetPassword,
        canActivate: [authRedirectionGuard],
      },
      {
        path: 'verify-email',
        component: VerifyEmail,
        canActivate: [permissionGuard],
        data: {
          requiredPermission: [UserType.ADMIN, UserType.OWNER, UserType.MANAGER, UserType.CUSTOMER],
          requireEmailVerified: false,
        },
      },
    ],
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
    path: 'settings',
    children: [
      {
        path: '',
        component: SettingPage,
        canActivate: [permissionGuard],
        data: {
          requiredPermission: [UserType.ADMIN, UserType.OWNER, UserType.MANAGER, UserType.CUSTOMER],
          showNavbar: true,
          showFooter: true,
        },
      },
      {
        path: 'display-and-accessibility',
        component: DisplayAndAccessibility,
        canActivate: [permissionGuard],
        data: {
          requiredPermission: [UserType.ADMIN, UserType.OWNER, UserType.MANAGER, UserType.CUSTOMER],
          showNavbar: true,
          showFooter: true,
        },
      },
      {
        path: 'change-password',
        component: ChangePassword,
        canActivate: [permissionGuard],
        data: {
          requiredPermission: [UserType.ADMIN, UserType.OWNER, UserType.MANAGER, UserType.CUSTOMER],
          showNavbar: true,
          showFooter: true,
        },
      },
      {
        path: 'privacy',
        component: PrivacyAndSecurity,
        canActivate: [permissionGuard],
        data: {
          requiredPermission: [UserType.ADMIN, UserType.OWNER, UserType.MANAGER, UserType.CUSTOMER],
          showNavbar: true,
          showFooter: true,
        },
      },
    ],
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
