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
  },  {
    path: 'attendance',
    loadChildren: () => import('./modules/attendace/attendace.module').then(m => m.AttendaceModule)
  },
  {
    path: 'shifts-section',
    loadChildren: () => import('./modules/shifts/shifts.module').then(m => m.ShiftsModule)
  },
  {
    path: 'vacation',
    loadChildren: () => import('./modules/vacarion-and-tasks/vacarion-and-tasks.module').then(m => m.VacarionAndTasksModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
