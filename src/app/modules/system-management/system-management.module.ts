import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SystemManagementRoutingModule } from './system-management-routing.module';
import { SystemManagementComponent } from './components/system-management/system-management.component';
import { SystemSetupComponent } from './components/system-setup/system-setup.component';
import { HijriDataComponent } from './components/hijri-data/hijri-data.component';
import { LanguageDataComponent } from './components/language-data/language-data.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { SessionsManagementComponent } from './components/sessions-management/sessions-management.component';


@NgModule({
  declarations: [
    SystemManagementComponent,
    SystemSetupComponent,
    HijriDataComponent,
    LanguageDataComponent,
    UserProfileComponent,
    SessionsManagementComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    SystemManagementRoutingModule
  ]
})
export class SystemManagementModule { }
