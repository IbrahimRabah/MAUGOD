import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PremissionsManaagementComponent } from './components/premissions-manaagement/premissions-manaagement.component';
import { BasicSystemItemsComponent } from './components/basic-system-items/basic-system-items.component';
import { ChartsListComponent } from './components/charts-list/charts-list.component';
import { ReportListComponent } from './components/report-list/report-list.component';
import { SystemMenusComponent } from './components/system-menus/system-menus.component';
import { SystemModulesComponent } from './components/system-modules/system-modules.component';
import { PermissionOnDataComponent } from './components/permission-on-data/permission-on-data.component';
import { AccessPermissionsComponent } from './components/access-permissions/access-permissions.component';
import { AccessPermissionsSummaryComponent } from './components/access-permissions-summary/access-permissions-summary.component';
import { PermissionsDelegationsComponent } from './components/permissions-delegations/permissions-delegations.component';
import { PremissionsOnSystemComponent } from './components/premissions-on-system/premissions-on-system.component';
import { UserRolesComponent } from './components/user-roles/user-roles.component';
import { UserRoleAssignmentComponent } from './components/user-role-assignment/user-role-assignment.component';
import { RoleChartRightsComponent } from './components/role-chart-rights/role-chart-rights.component';
import { RoleModuleRightsComponent } from './components/role-module-rights/role-module-rights.component';
import { RoleReportRightsComponent } from './components/role-report-rights/role-report-rights.component';
import { RequestPostPremisionsComponent } from './components/request-post-premisions/request-post-premisions.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'premissions-manaagement',
    pathMatch: 'full'
  },
  {
    path: 'premissions-manaagement',
    component: PremissionsManaagementComponent
  },
  {
    path: 'basic-system-items',
    component: BasicSystemItemsComponent
  },
  {
    path: 'charts-list',
    component: ChartsListComponent
  },
  {
    path: 'report-list',
    component: ReportListComponent
  },
  {
    path: 'system-menus',
    component: SystemMenusComponent
  },
  {
    path: 'system-modules',
    component: SystemModulesComponent
  },
  {
    path: 'permission-on-data',
    component: PermissionOnDataComponent
  },
  {
    path: 'access-permissions',
    component: AccessPermissionsComponent
  },
  {
    path: 'access-permissions-summary',
    component: AccessPermissionsSummaryComponent
  },
  {
    path: 'permissions-delegations',
    component: PermissionsDelegationsComponent
  },
  {
    path: 'premissions-on-system',
    component: PremissionsOnSystemComponent
  },
  {
    path: 'user-roles',
    component: UserRolesComponent
  },
  {
    path: 'user-role-assignment',
    component: UserRoleAssignmentComponent
  },
  {
    path: 'role-chart-rights',
    component: RoleChartRightsComponent
  },
  {
    path: 'role-module-rights',
    component: RoleModuleRightsComponent
  },
  {
    path: 'role-report-rights',
    component: RoleReportRightsComponent
  },
  {
    path: 'request-post-premisions',
    component: RequestPostPremisionsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionManagementsRoutingModule { }
