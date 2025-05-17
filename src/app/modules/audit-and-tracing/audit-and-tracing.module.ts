import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuditAndTracingRoutingModule } from './audit-and-tracing-routing.module';
import { AuditAndTracingComponent } from './components/audit-and-tracing/audit-and-tracing.component';
import { TrackChangesComponent } from './components/track-changes/track-changes.component';
import { LoginTraceComponent } from './components/login-trace/login-trace.component';
import { ErrorLogsComponent } from './components/error-logs/error-logs.component';
import { TablesTraceSettingsComponent } from './components/tables-trace-settings/tables-trace-settings.component';


@NgModule({
  declarations: [
    AuditAndTracingComponent,
    TrackChangesComponent,
    LoginTraceComponent,
    ErrorLogsComponent,
    TablesTraceSettingsComponent
  ],
  imports: [
    CommonModule,
    AuditAndTracingRoutingModule
  ]
})
export class AuditAndTracingModule { }
