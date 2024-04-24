import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.scss'],
})
export class AuthorizeComponent implements OnInit {

  constructor(private router: Router, private actRouter: ActivatedRoute, private authService: AuthService) {
    this.actRouter.queryParams.subscribe((param: Params) => {
      const state = param['state'];
      if (this.authService.hasValidToken()) {
        this.router.navigateByUrl(state || '/app/dashboard');
      } else if (state) {
        this.router.navigate(['/auth/login'], { queryParams: { state } });
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  ngOnInit() { }

}
