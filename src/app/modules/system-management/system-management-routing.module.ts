import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemManagementComponent } from './components/system-management/system-management.component';
import { SystemSetupComponent } from './components/system-setup/system-setup.component';
import { HijriDataComponent } from './components/hijri-data/hijri-data.component';
import { LanguageDataComponent } from './components/language-data/language-data.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { SessionsManagementComponent } from './components/sessions-management/sessions-management.component';

const routes: Routes = [
  {
    path: '',
    component: SystemManagementComponent,
    pathMatch: 'full'
  },
  {
    path: 'system-management',
    component: SystemManagementComponent,
    
  },
      {
        path: 'system-setup',
        component: SystemSetupComponent
      },
      {
        path: 'hijri-data',
        component: HijriDataComponent
      },
      {
        path: 'language-data',
        component: LanguageDataComponent
      },
      {
        path: 'user-profile',
        component: UserProfileComponent
      },
      {
        path: 'sessions-management',
        component: SessionsManagementComponent
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemManagementRoutingModule { }
