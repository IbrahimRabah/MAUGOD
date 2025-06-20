import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule)
  },
  {
    path: 'attendance',
    loadChildren: () => import('./modules/attendace/attendace.module').then(m => m.AttendaceModule)
  },
  {
    path: 'shifts-section',
    loadChildren: () => import('./modules/shifts/shifts.module').then(m => m.ShiftsModule)
  },
  {
    path: 'vacation-tasks',
    loadChildren: () => import('./modules/vacarion-and-tasks/vacarion-and-tasks.module').then(m => m.VacarionAndTasksModule)
  },
  {
    path: 'requests-and-approvals',
    loadChildren: () => import('./modules/requests-and-approvals/requests-and-approvals.module').then(m => m.RequestsAndApprovalsModule)
  },
  {
    path: 'tracking-locations',
    loadChildren: () => import('./modules/tracking-locations/tracking-locations.module').then(m => m.TrackingLocationsModule)
  },
  {
    path: 'mobile-and-app',
    loadChildren: () => import('./modules/mobile-and-app/mobile-and-app.module').then(m => m.MobileAndAppModule)
  },
  {
    path: 'salaries',
    loadChildren: () => import('./modules/salaries/salaries.module').then(m => m.SalariesModule)
  },
  {
    path: 'primary-data',
    loadChildren: () => import('./modules/primary-data/primary-data.module').then(m => m.PrimaryDataModule)
  },
  {
    path: 'messages-and-notifications',
    loadChildren: () => import('./modules/messages-and-notifications/messages-and-notifications.module').then(m => m.MessagesAndNotificationsModule)
  },
  {
    path: 'permission-managements',
    loadChildren: () => import('./modules/permission-managements/permission-managements.module').then(m => m.PermissionManagementsModule)
  },
  {
    path: 'audit-and-tracing',
    loadChildren: () => import('./modules/audit-and-tracing/audit-and-tracing.module').then(m => m.AuditAndTracingModule)
  },
  {
    path: 'system-management',
    loadChildren: () => import('./modules/system-management/system-management.module').then(m => m.SystemManagementModule)
  },
  {
    path: 'consorship',
    loadChildren: () => import('./modules/consorship/consorship.module').then(m => m.ConsorshipModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/authentication/authentication.module').then(m => m.AuthenticationModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
