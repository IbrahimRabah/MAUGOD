import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { PermissionManagementsRoutingModule } from './permission-managements-routing.module';
import { PremissionsManaagementComponent } from './components/premissions-manaagement/premissions-manaagement.component';
import { PremissionsOnSystemComponent } from './components/premissions-on-system/premissions-on-system.component';
import { BasicSystemItemsComponent } from './components/basic-system-items/basic-system-items.component';
import { PermissionOnDataComponent } from './components/permission-on-data/permission-on-data.component';
import { UserRolesComponent } from './components/user-roles/user-roles.component';
import { UserRoleAssignmentComponent } from './components/user-role-assignment/user-role-assignment.component';
import { RoleChartRightsComponent } from './components/role-chart-rights/role-chart-rights.component';
import { RoleModuleRightsComponent } from './components/role-module-rights/role-module-rights.component';
import { RoleReportRightsComponent } from './components/role-report-rights/role-report-rights.component';
import { ChartsListComponent } from './components/charts-list/charts-list.component';
import { ReportListComponent } from './components/report-list/report-list.component';
import { SystemMenusComponent } from './components/system-menus/system-menus.component';
import { SystemModulesComponent } from './components/system-modules/system-modules.component';
import { AccessPermissionsComponent } from './components/access-permissions/access-permissions.component';
import { AccessPermissionsSummaryComponent } from './components/access-permissions-summary/access-permissions-summary.component';
import { RequestPostPremisionsComponent } from './components/request-post-premisions/request-post-premisions.component';
import { PermissionsDelegationsComponent } from './components/permissions-delegations/permissions-delegations.component';


@NgModule({
  declarations: [
    PremissionsManaagementComponent,
    PremissionsOnSystemComponent,
    BasicSystemItemsComponent,
    PermissionOnDataComponent,
    UserRolesComponent,
    UserRoleAssignmentComponent,
    RoleChartRightsComponent,
    RoleModuleRightsComponent,
    RoleReportRightsComponent,
    ChartsListComponent,
    ReportListComponent,
    SystemMenusComponent,
    SystemModulesComponent,
    AccessPermissionsComponent,
    AccessPermissionsSummaryComponent,
    RequestPostPremisionsComponent,
    PermissionsDelegationsComponent
  ],
  imports: [
    CommonModule,
    PermissionManagementsRoutingModule,
    TranslateModule
  ]
})
export class PermissionManagementsModule { }
