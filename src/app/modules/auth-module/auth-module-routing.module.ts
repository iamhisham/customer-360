import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { SignupComponent } from './components/signup/signup.component';
import { AuthorizeComponent } from 'src/app/core/components/authorize/authorize.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { NewPasswordCreateComponent } from './components/new-password-create/new-password-create.component';

const routes: Routes = [

  { path: 'login', component: LoginComponent, },
  { path: 'logout', component: LogoutComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'authorize', component: AuthorizeComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'create-password', component: NewPasswordCreateComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthModulePageRoutingModule {}
