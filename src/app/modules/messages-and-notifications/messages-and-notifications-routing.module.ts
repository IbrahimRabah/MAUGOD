import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasseagesAndNotificationsComponent } from './components/masseages-and-notifications/masseages-and-notifications.component';
import { SystemMessagesComponent } from './components/system-messages/system-messages.component';
import { NotificationsTextComponent } from './components/notifications-text/notifications-text.component';
import { NewsComponent } from './components/news/news.component';
import { SendNotificationsComponent } from './components/send-notifications/send-notifications.component';
import { NotificationsSettingsComponent } from './components/notifications-settings/notifications-settings.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'messages-and-notifications',
    pathMatch: 'full'
  },
  {
    path: 'messages-and-notifications',
    component: MasseagesAndNotificationsComponent
  },
  {
    path: 'system-messages',
    component: SystemMessagesComponent
  },
  {
    path: 'notifications-text',
    component: NotificationsTextComponent
  },
  {
    path: 'news',
    component: NewsComponent
  },
  {
    path: 'send-notifications',
    component: SendNotificationsComponent
  },
  {
    path: 'notifications-settings',
    component: NotificationsSettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagesAndNotificationsRoutingModule { }
