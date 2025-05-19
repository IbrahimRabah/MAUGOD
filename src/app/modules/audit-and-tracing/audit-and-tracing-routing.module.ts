import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditAndTracingComponent } from './components/audit-and-tracing/audit-and-tracing.component';
import { TrackChangesComponent } from './components/track-changes/track-changes.component';
import { LoginTraceComponent } from './components/login-trace/login-trace.component';
import { ErrorLogsComponent } from './components/error-logs/error-logs.component';
import { TablesTraceSettingsComponent } from './components/tables-trace-settings/tables-trace-settings.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'audit-and-tracing',
    pathMatch: 'full'
  },
  {
    path: 'audit-and-tracing',
    component: AuditAndTracingComponent
  },
  {
    path: 'track-changes',
    component: TrackChangesComponent
  },
  {
    path: 'login-trace',
    component: LoginTraceComponent
  },
  {
    path: 'error-logs',
    component: ErrorLogsComponent
  },
  {
    path: 'tables-trace-settings',
    component: TablesTraceSettingsComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditAndTracingRoutingModule { }
