import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/auth/authorize'], { queryParams: { state: state.url } });
      return false;
    } else if (!this.authService.hasValidToken()) {
      var isSuccessfullyRenewed = await this.authService.renewTokenAndUpdateCookie();
      if (!isSuccessfullyRenewed) {
        this.router.navigate(['/auth/authorize'], { queryParams: { state: state.url } });
        return false;
      }
    }
    return true;
  }

}
