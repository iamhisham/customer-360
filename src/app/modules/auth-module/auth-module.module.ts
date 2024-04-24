import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AuthModulePageRoutingModule } from './auth-module-routing.module';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { NewPasswordCreateComponent } from './components/new-password-create/new-password-create.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { SignupComponent } from './components/signup/signup.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    AuthModulePageRoutingModule
  ],
  declarations: [
    LoginComponent,
    LogoutComponent,
    NewPasswordCreateComponent,
    ResetPasswordComponent,
    SignupComponent
  ]
})
export class AuthModulePageModule {
  constructor() {
    console.log('AuthModulePageModule')
  }
}
