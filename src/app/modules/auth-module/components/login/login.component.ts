import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../service/common.service';
import { AESEncryptDecryptServiceService } from '../../../../core/services/aes-encrypt-decrypt-service.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConstantService } from 'src/app/service/constant.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  user: any = {};
  state: string = '';
  showVerificationCodeView = false;
  ischeckedcode: boolean = false;

  @ViewChild('showpassword') passwordInput!: any;

  constructor(public router: Router, public commonService: CommonService, private authService: AuthService,
    private AESEncryptDecryptService: AESEncryptDecryptServiceService, private ConstantService: ConstantService) { 
      if (this.authService.hasToken()) {
        this.router.navigateByUrl(this.ConstantService.LOGIN.LOGIN_HOME_ROUTE);
      }
    }

  ngOnInit() { }

  login() {
    try {
      if (!this.user.email) throw { message: "Please enter email address" };
      if (!this.user.password) throw { message: "Please enter password" };
      this.commonService.showLoader();
      var loginRequestPayload: any = {
        email: this.user.email,
        password: this.AESEncryptDecryptService.encrypt(this.user.password)
      };
      this.authService.login(loginRequestPayload).subscribe({
        next: async (details: any) => {
          this.authService.setTokenToCookie(details);
          if (details.newPasswordRequired) {
            this.authService.setSessionData(details.session);
            this.commonService.hideLoader();
            this.router.navigate(['/auth/create-password']);
          } else {
            this.commonService.hideLoader();
            await this.commonService.storage.set('username', details.name);
            this.router.navigateByUrl(this.state || '/app/dashboard');
            location.href = this.state || '/app/dashboard';
          }
        },
        error: async (err: any) => {
          delete this.user.password;
          this.commonService.hideLoader();
          await this.authService.deleteLoginDetails();
          err = err.error?.error || err.error || err;
          if (err.code == 1001) {
            this.commonService.toster.error("The user's confirmation is pending. Please provide the confirmation code that was sent via email.");
            this.showVerificationCodeView = true;
            this.authService.resendConfirmation(this.user).subscribe(
              {
                next: (details: any) => {
                  this.commonService.hideLoader();
                },
                error: (err: any) => {
                  this.commonService.hideLoader();
                  err = err.error?.error || err.error || err;
                  this.commonService.toster.error(err.message || 'User registration failed');
                }
              }
            );
            // this.router.navigateByUrl('/home');
          } else {
            this.commonService.toster.error(err.message || 'Failed');
          }
        }
      });
    } catch (e: any) {
      this.commonService.hideLoader();
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    }
  }

  showPasswordtoggle(status: any) {
    if (status == 'keyUp')
      this.passwordInput.type = 'password';
    this.passwordInput.type = status == 'leave' ? 'text' : 'password';
  }

  emailConfirmationCode() {
    try {
      if (!this.user.confirmationCode) throw "Please enter confirmation code";
      var SignUpRequestPayload: any = {
        email: this.user.email,
        confirmationCode: this.user.confirmationCode
      };
      this.commonService.showLoader();
      this.authService.confirmRegistration(SignUpRequestPayload).subscribe(
        {
          next: (details: any) => {
            this.commonService.hideLoader();
            this.ischeckedcode = true;//succes checkbox
            this.showVerificationCodeView = false;
            this.commonService.toster.success('Email confirmed successfully');
            setTimeout((delay: any) => {
              this.router.navigateByUrl('/auth/login');
            }, 1000)
          },
          error: (err: any) => {
            this.commonService.hideLoader();
            err = err.error?.error || err.error || err;
            this.commonService.toster.error(err.message || 'User registration failed');
          }
        }
      )
    }
    catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
      this.commonService.hideLoader();
    }
  }
  resendConfirmationCode() {
    try {
      this.commonService.showLoader();
      this.authService.resendConfirmation({ email: this.user.email }).subscribe(
        {
          next: (data: any) => {
            this.commonService.hideLoader();
            this.commonService.toster.success('Code has been sent successfully');
          },
          error: (err: any) => {
            this.commonService.hideLoader();
            err = err.error?.error || err.error || err;
            this.commonService.toster.error(err.message || 'Failed');
          }
        }
      )
    } catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
      this.commonService.hideLoader();
    }
  }
}
