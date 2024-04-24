import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from 'src/app/core/services/auth.guard';

import { UsersInfoComponent } from './components/users-info/users-info.component';
import { UserGroupsComponent } from './components/user-groups/user-groups.component';
import { UserRoleComponent } from './components/user-role/user-role.component';
import { PermissionComponent } from './components/permission/permission.component';

const routes: Routes = [
  { path: 'users', component: UsersInfoComponent, canActivate: [AuthGuard] },
  { path: 'usergroups', component: UserGroupsComponent, canActivate: [AuthGuard] },
  { path: 'role', component: UserRoleComponent, canActivate: [AuthGuard] },
  { path: 'permission', component: PermissionComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'users', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementModulePageRoutingModule {}
