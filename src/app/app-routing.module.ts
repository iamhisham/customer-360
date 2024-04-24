import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth-module/auth-module.module').then(m => m.AuthModulePageModule)
  },
  {
    path: 'customers',
    loadChildren: () => import('./modules/customer-module/customer-module.module').then(m => m.CustomerModulePageModule)
  },
  {
    path: 'notification-center',
    loadChildren: () => import('./modules/notification-module/notification-module.module').then(m => m.NotificationModulePageModule)
  },
  {
    path: 'app',
    loadChildren: () => import('./modules/dashboard-module/dashboard-module.module').then(m => m.DashboardModulePageModule)
  },
  {
    path: 'user-management',
    loadChildren: () => import('./modules/user-management-module/user-management-module.module').then(m => m.UserManagementModulePageModule)
  },
  {
    path: 'data-setup',
    loadChildren: () => import('./modules/datasetup-module/datasetup-module.module').then(m => m.DatasetupModulePageModule)
  },
  { path: '**', redirectTo: 'app/dashboard', pathMatch: 'full' },
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
