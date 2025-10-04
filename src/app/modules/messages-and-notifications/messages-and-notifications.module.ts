import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MessagesAndNotificationsRoutingModule } from './messages-and-notifications-routing.module';
import { MasseagesAndNotificationsComponent } from './components/masseages-and-notifications/masseages-and-notifications.component';
import { SystemMessagesComponent } from './components/system-messages/system-messages.component';
import { NotificationsTextComponent } from './components/notifications-text/notifications-text.component';
import { NewsComponent } from './components/news/news.component';
import { SendNotificationsComponent } from './components/send-notifications/send-notifications.component';
import { NotificationsSettingsComponent } from './components/notifications-settings/notifications-settings.component';

@NgModule({
  declarations: [
  
    MasseagesAndNotificationsComponent,
       SystemMessagesComponent,
       NotificationsTextComponent,
       NewsComponent,
       SendNotificationsComponent,
       NotificationsSettingsComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MessagesAndNotificationsRoutingModule
  ]
})
export class MessagesAndNotificationsModule { }
