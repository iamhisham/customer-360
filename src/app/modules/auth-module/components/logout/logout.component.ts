import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../service/common.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {

  constructor(private commonService: CommonService, private authService: AuthService) {
    this.commonService.showLoader();
    if (this.authService.hasToken()) {
      this.authService.logout().subscribe({
        next: async (details: any) => {
          await this.authService.deleteLoginDetails();
          location.href = '/auth/login';
        },
        error: async (err: any) => {
          await this.authService.deleteLoginDetails();
          err = err.error?.error || err.error || err;
          console.log(err.message || 'Failed');
          location.href = '/auth/login';
        }
      });
    } else {
      location.href = '/auth/login';
    }
  }

  ngOnInit() { }

}
