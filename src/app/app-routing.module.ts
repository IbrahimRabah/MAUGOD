import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/authentication/authentication.module').then(m => m.AuthenticationModule),
    canActivate: [noAuthGuard] // Prevent authenticated users from accessing auth routes
  },
  {
    path: 'home',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
    canActivate: [authGuard] // Protect home route
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [authGuard] // Protect dashboard route
  },
  {
    path: 'reports',
    loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule),
    canActivate: [authGuard] // Protect reports route
  },
  {
    path: 'attendance',
    loadChildren: () => import('./modules/attendace/attendace.module').then(m => m.AttendaceModule),
    canActivate: [authGuard] // Protect attendance route
  },
  {
    path: 'shifts-section',
    loadChildren: () => import('./modules/shifts/shifts.module').then(m => m.ShiftsModule),
    canActivate: [authGuard] // Protect shifts route
  },
  {
    path: 'vacation-tasks',
    loadChildren: () => import('./modules/vacarion-and-tasks/vacarion-and-tasks.module').then(m => m.VacarionAndTasksModule),
    canActivate: [authGuard] // Protect vacation-tasks route
  },
  {
    path: 'requests-and-approvals',
    loadChildren: () => import('./modules/requests-and-approvals/requests-and-approvals.module').then(m => m.RequestsAndApprovalsModule),
    canActivate: [authGuard] // Protect requests-and-approvals route
  },
  {
    path: 'tracking-locations',
    loadChildren: () => import('./modules/tracking-locations/tracking-locations.module').then(m => m.TrackingLocationsModule),
    canActivate: [authGuard] // Protect tracking-locations route
  },
  {
    path: 'mobile-and-app',
    loadChildren: () => import('./modules/mobile-and-app/mobile-and-app.module').then(m => m.MobileAndAppModule),
    canActivate: [authGuard] // Protect mobile-and-app route
  },
  {
    path: 'salaries',
    loadChildren: () => import('./modules/salaries/salaries.module').then(m => m.SalariesModule),
    canActivate: [authGuard] // Protect salaries route
  },
  {
    path: 'primary-data',
    loadChildren: () => import('./modules/primary-data/primary-data.module').then(m => m.PrimaryDataModule),
    canActivate: [authGuard] // Protect primary-data route
  },
  {
    path: 'messages-and-notifications',
    loadChildren: () => import('./modules/messages-and-notifications/messages-and-notifications.module').then(m => m.MessagesAndNotificationsModule),
    canActivate: [authGuard] // Protect messages-and-notifications route
  },
  {
    path: 'permission-managements',
    loadChildren: () => import('./modules/permission-managements/permission-managements.module').then(m => m.PermissionManagementsModule),
    canActivate: [authGuard] // Protect permission-managements route
  },
  {
    path: 'audit-and-tracing',
    loadChildren: () => import('./modules/audit-and-tracing/audit-and-tracing.module').then(m => m.AuditAndTracingModule),
    canActivate: [authGuard] // Protect audit-and-tracing route
  },
  {
    path: 'system-management',
    loadChildren: () => import('./modules/system-management/system-management.module').then(m => m.SystemManagementModule),
    canActivate: [authGuard] // Protect system-management route
  },
  {
    path: 'consorship',
    loadChildren: () => import('./modules/consorship/consorship.module').then(m => m.ConsorshipModule),
    canActivate: [authGuard] // Protect consorship route
  },
  { path: '**', 
    loadComponent: () => import('./shared/components/notfound/notfound.component').then(m => m.NotfoundComponent) 
  }
// or a "Not Found" page

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
