import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AESEncryptDecryptServiceService } from '../../../../core/services/aes-encrypt-decrypt-service.service';
import { CommonService } from '../../../../service/common.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConstantService } from 'src/app/service/constant.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {

  user: any = {};
  showVerificationCodeView: boolean = false;
  ischeckedcode: boolean = false;
  showConfirmationCodeView: boolean = false;
  @ViewChild('showpassword') passwordInput!: any;
  @ViewChild('showConfirmpassword') confirmPasswordInput!: any;
  constructor(public commonService: CommonService, private authService: AuthService, private router: Router,
    private AESEncryptDecryptService: AESEncryptDecryptServiceService, private ConstantService: ConstantService) { 
      if (this.authService.hasToken()) {
        this.router.navigateByUrl(this.ConstantService.LOGIN.LOGIN_HOME_ROUTE);
      }
    }

  ngOnInit() {
  }

  validateEmail(isResendPwdFlow: any) {
    try {
      if (!this.user.email) throw "Please enter email address";

      this.commonService.showLoader();
      this.authService.resetPassword({ email: this.user.email }).subscribe({
        next: (data: any) => {
          this.commonService.hideLoader();
          this.showVerificationCodeView = true;
          this.commonService.toster.success(isResendPwdFlow ? 'Verification code resent successfully' : 'Code sent successfully');
        },
        error: (err: any) => {
          err = err.error?.error || err.error || err;
          if (err.CUSTOM_ERROR_CODE == 1001) {
            this.commonService.toster.error("The user's confirmation is pending. Please provide the confirmation code that was sent via email.");
            this.showConfirmationCodeView = true;
          } else {
            this.commonService.toster.error(err.message || 'Failed');
          }
          this.commonService.hideLoader();
        }
      })
    } catch (e: any) {
      this.commonService.hideLoader();
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    }

  }

  resetPassword() {
    try {
      if (!this.user.confirmationCode) throw "Please enter confirmation code";
      if (!this.user.password) throw "Please enter password";
      if (!this.user.confirmPassword) throw "Please enter confirm password";
      if (this.user.password != this.user.confirmPassword) throw "Password not matched";

      var loginRequestPayload: any = {
        confirmationCode: this.user.confirmationCode,
        password: this.AESEncryptDecryptService.encrypt(this.user.password),
        email: this.user.email
      };
      this.commonService.showLoader();
      this.authService.confirmForgotPassword(loginRequestPayload).subscribe({
        next: (data: any) => {
          this.commonService.hideLoader();
          this.commonService.toster.success('Password got reset successfully');
          this.router.navigateByUrl('/auth/login');
        },
        error: (err: any) => {
          this.commonService.hideLoader();
          err = err.error?.error || err.error || err;
          this.commonService.toster.error(err.message || 'Failed');
        }
      })
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

  showConfirmPasswordtoggle(status: any) {
    if (status == 'keyUpConfirm')
      this.confirmPasswordInput.type = 'password';
    this.confirmPasswordInput.type = status == 'leave' ? 'text' : 'password';
  }

  emailConfirmationCode() {
    try {
      if (!this.user.signUpconfirmationCode) throw "Please enter confirmation code";
      var SignUpRequestPayload: any = {
        email: this.user.email,
        confirmationCode: this.user.signUpconfirmationCode
      };
      this.commonService.showLoader();
      this.authService.confirmRegistration(SignUpRequestPayload).subscribe(
        {
          next: (details: any) => {
            this.commonService.hideLoader();
            this.ischeckedcode = true;//succes checkbox
            this.validateEmail(false);
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
            this.commonService.toster.success('Code has been Sent Successfully');
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
