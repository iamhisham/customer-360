import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from 'src/app/core/services/auth.guard';

import { RecentlySentComponent } from './components/recently-sent/recently-sent.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { ConfigCategoryCreateUpdateComponent } from './components/configuration/config-category-create-update/config-category-create-update';
import { ConfigTemplate } from './components/config-template/config-template';
import { TempCreate } from './components/config-template/temp-create/temp-create';
import { NotificationUiComponent } from './components/notification-ui/notification-ui.component';
import { NotificationUiCreateComponent } from './components/notification-ui/notification-ui-create/notification-ui-create.component';
import { NotificationHistoryComponent } from './components/notification-ui/notification-history/notification-history.component';
import { AbTestingComponent } from './components/ab-testing/ab-testing.component';
import { AbTestingResultComponent } from './components/ab-testing/ab-testing-result/ab-testing-result.component';
import { QueueComponent } from './components/queue/queue.component';
import { ErrorComponent } from './components/error/error.component';
import { UserBasedNotificationHistoryComponentComponent } from './components/user-based-notification-history-component/user-based-notification-history-component.component';

const routes: Routes = [

  { path: 'recently-sent', component: RecentlySentComponent, canActivate: [AuthGuard] },
  
  { path: 'category', component: ConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'category/create', component: ConfigCategoryCreateUpdateComponent, canActivate: [AuthGuard] },
  { path: 'category/:category_id', component: ConfigCategoryCreateUpdateComponent, canActivate: [AuthGuard] },
  { path: 'category/clone/:clone_category_id', component: ConfigCategoryCreateUpdateComponent, canActivate: [AuthGuard] },

  { path: 'template', component: ConfigTemplate, canActivate: [AuthGuard] },
  { path: 'template/create', component: TempCreate, canActivate: [AuthGuard] },
  { path: 'template/:template_id', component: TempCreate, canActivate: [AuthGuard] },
  { path: 'template/clone/:clone_template_id', component: TempCreate, canActivate: [AuthGuard] },


  { path: 'notification', component: NotificationUiComponent, canActivate: [AuthGuard] },
  { path: 'notification/create', component: NotificationUiCreateComponent, canActivate: [AuthGuard] },
  { path: 'notification/:notification_id', component: NotificationUiCreateComponent, canActivate: [AuthGuard] },
  { path: 'notification/clone/:clone_notification_id', component: NotificationUiCreateComponent, canActivate: [AuthGuard] },
  { path: 'notification/:notification_id/history', component: NotificationHistoryComponent, canActivate: [AuthGuard] },

  { path: 'ab-testing', component: AbTestingComponent, canActivate: [AuthGuard] },
  { path: 'ab-testing/create', component: NotificationUiCreateComponent, canActivate: [AuthGuard] },
  { path: 'ab-testing/:notification_id', component: NotificationUiCreateComponent, canActivate: [AuthGuard] },
  { path: 'ab-testing/clone/:clone_notification_id', component: NotificationUiCreateComponent, canActivate: [AuthGuard] },
  { path: 'ab-testing/:notification_id/history/:variant_id', component: NotificationHistoryComponent, canActivate: [AuthGuard] },
  { path: 'ab-testing/result/:notification_id', component: AbTestingResultComponent, canActivate: [AuthGuard] },

  { path: 'queue', component: QueueComponent, canActivate: [AuthGuard] },
  { path: 'error', component: ErrorComponent, canActivate: [AuthGuard] },

  { path: 'user-profile/:user_id/history', component: UserBasedNotificationHistoryComponentComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'recently-sent', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationModulePageRoutingModule { }
