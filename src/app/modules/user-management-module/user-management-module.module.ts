import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserManagementModulePageRoutingModule } from './user-management-module-routing.module';
import { UsersInfoComponent } from './components/users-info/users-info.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { UserGroupsComponent } from './components/user-groups/user-groups.component';
import { UserRoleComponent } from './components/user-role/user-role.component';
import { PermissionComponent } from './components/permission/permission.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserManagementModulePageRoutingModule,
    SharedModule
  ],
  declarations: [
    UsersInfoComponent,
    UserGroupsComponent,
    UserRoleComponent,
    PermissionComponent
  ]
})
export class UserManagementModulePageModule {
  constructor() {
    console.log('UserManagementModulePageModule')
  }
}
