import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonService } from '../../../../service/common.service';
import { AESEncryptDecryptServiceService } from '../../../../core/services/aes-encrypt-decrypt-service.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConstantService } from 'src/app/service/constant.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})

export class SignupComponent implements OnInit {
  state: string = '';
  user: any = {};
  showVerificationCodeView = false;
  ischeckedcode: boolean = false;
  today = new Date();
  year = this.today.getFullYear();
  month = ('0' + (this.today.getMonth() + 1)).slice(-2);
  day = ('0' + this.today.getDate()).slice(-2);
  formattedDate = this.year + '-' + this.month + '-' + this.day;

  @ViewChild('showpassword') passwordInput!: any;
  @ViewChild('showConfirmpassword') confirmPasswordInput!: any;

  constructor(public router: Router, private actRouter: ActivatedRoute, public commonService: CommonService, 
    private authService: AuthService, private AESEncryptDecryptService: AESEncryptDecryptServiceService, private ConstantService: ConstantService) {
    if (this.authService.hasToken()) {
      this.router.navigateByUrl(this.ConstantService.LOGIN.LOGIN_HOME_ROUTE);
    }
    this.actRouter.queryParams.subscribe((param: Params) => {
      this.state = param['state'];
    });
  }

  ngOnInit() { }

  signUp() {
    try {
      this.validateRegistrationDetails();
      if (this.user.phoneNumberExtenstion) {
        this.user.phoneNumberExtenstion = this.user.phoneNumberExtenstion.toString();
      }
      this.commonService.showLoader();
      var requestPayload = JSON.parse(JSON.stringify(this.user));
      requestPayload.password = this.AESEncryptDecryptService.encrypt(this.user.password),
        this.authService.signup(requestPayload).subscribe({
          next: (details: any) => {
            this.commonService.hideLoader();
            this.showVerificationCodeView = true;
            // this.commonService.setTokenToCookie(details);
          },
          error: (err: any) => {
            err = err.error?.error || err.error || err;
            if (err.CUSTOM_ERROR_CODE == 1001) {
              this.commonService.toster.error("The user's confirmation is pending. Please provide the confirmation code that was sent via email.");
              this.showVerificationCodeView = true;
            } else {
              this.commonService.toster.error(err.message || 'User registration failed');
            }
            this.commonService.hideLoader();
          }
        });
    }
    catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    }
  }

  validateRegistrationDetails() {
    if (this.user.length > 0)
      Object.keys(this.user).forEach(key => {
        if (typeof (this.user[key] == "string")) this.user[key] = this.user[key].trim();
      });

    const emailRegex = new RegExp(/^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/);
    const phoneNumberExtenstionRegex = new RegExp(/^[\+]{1}[0-9]{1,9}$/);  //{3}[\s-]
    if (!this.user.firstName) throw { message: "Please enter first name" };
    if (this.user.firstName.trim().length === 0) throw { message: "Please enter first name" };
    if (!this.user.lastName) throw { message: "Please enter last name" };
    if (this.user.lastName.trim().length === 0) throw { message: "Please enter last name" };
    // if (this.user.birthdate) {
    //   if (this.user.birthdate > this.formattedDate) throw { message: "Please enter valid date of birth" };
    // }
    if (!this.user.email) throw { message: "Please enter email address" };
    if (!emailRegex.test(this.user.email)) { throw { message: "Email is not valid" } };
    // if (!this.user.gender) throw { message: "Please select gender" };
    // if (!this.user.phoneNumberExtenstion) throw { message: "Please enter phone number extenstion" };
    // if (this.user.phoneNumberExtenstion) {
    //   if (!phoneNumberExtenstionRegex.test(this.user.phoneNumberExtenstion)) throw { message: "Please enter correct phone number extenstion" };
    // }
    // if (!this.user.phoneNumber) throw { message: "Please enter phone number" };
    if (this.user.phoneNumber) {
      if (isNaN(this.user.phoneNumber)) throw { message: "Phone number is not valid" };
    }
    if (!this.user.password) throw { message: "Please enter password" };
    if (!this.user.confirmPassword) throw { message: "Please enter confirm password" };
    if (this.user.password != this.user.confirmPassword) throw "Confirm password not matched";
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
            setTimeout((delay: any) => { this.router.navigateByUrl('/auth/login'); }, 1000)
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
}
