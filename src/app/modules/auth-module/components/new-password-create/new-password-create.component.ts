import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonService } from '../../../../service/common.service';
import { AESEncryptDecryptServiceService } from '../../../../core/services/aes-encrypt-decrypt-service.service';
import { ConstantService } from 'src/app/service/constant.service';
@Component({
  selector: 'app-new-password-create',
  templateUrl: './new-password-create.component.html',
  styleUrls: ['./new-password-create.component.scss'],
})
export class NewPasswordCreateComponent implements OnInit {
  user: any = {};
  sessionData: any;

  @ViewChild('showpassword') passwordInput!: any;
  constructor(private commonService: CommonService, private router: Router, private authService: AuthService,
    private AESEncryptDecryptService: AESEncryptDecryptServiceService, private ConstantService: ConstantService) { 
      if (this.authService.hasToken()) {
        this.router.navigateByUrl(this.ConstantService.LOGIN.LOGIN_HOME_ROUTE);
      }
    }

  ngOnInit() {
    this.authService.sessionData$.subscribe(data => {
      this.sessionData = data;
    });
  }
  CreatePassword() {
    try {
      if (!this.user.email) throw "Please enter email";
      if (!this.user.password) throw "Please enter password";
      if (!this.user.confirmPassword) throw "Please enter confirm password";
      var createPassword: any = {
        email: this.user.email,
        password: this.AESEncryptDecryptService.encrypt(this.user.conformationPassword),
        session: this.sessionData,
      };
      this.commonService.showLoader();
      this.authService.createPassword(createPassword).subscribe({
        next: (data: any) => {
          this.commonService.hideLoader();
          this.commonService.toster.success('Password Create successfully');
          this.router.navigate(['/auth/login']);
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
}
