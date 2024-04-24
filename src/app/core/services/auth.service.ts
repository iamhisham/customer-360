import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from '../../service/common.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  URL: any = environment.URL;
  tokenTimer: any = null;
  tokenBufferTime: number = 1 * 60 * 1000; // 1 Min

  userDetails: any = {};

  private sessionDataSubject = new BehaviorSubject<any>(null);
  sessionData$ = this.sessionDataSubject.asObservable();

  setSessionData(data: any) {
    this.sessionDataSubject.next(data);
  }
  constructor(private cookieService: CookieService, private commonService: CommonService,
    private http: HttpClient, public loadingCtrl: LoadingController, private router: Router) {
    this.validateToken();
  }

  hasToken() {
    return this.cookieService.get('XSRF-TOKEN') ? true : false;
  }

  hasValidToken(token = this.cookieService.get('XSRF-TOKEN')) {
    if (token) {
      const decode: any = jwtDecode(token);
      return (decode.exp * 1000) > new Date().getTime();
    }
    return false;
  }


  validateToken() {
    if (this.tokenTimer) clearInterval(this.tokenTimer);
    const token = this.cookieService.get('XSRF-TOKEN');
    if (token && this.hasValidToken(token)) {
      const decode: any = jwtDecode(token);
      const expDuration = (decode.exp * 1000) - new Date().getTime();
      if (expDuration > this.tokenBufferTime) {
        this.tokenTimer = setTimeout(() => this.renewTokenAndUpdateCookie(), (expDuration - this.tokenBufferTime));
      } else {
        this.renewTokenAndUpdateCookie();
      }
    }
  }

  async renewTokenAndUpdateCookie() {
    try {
      const details: any = await this.renewToken().toPromise();
      this.setTokenToCookie(details);
      this.validateToken();
      return true;
    } catch (err: any) {
      err = err.error?.error || err.error || err;
      console.log(err.message || 'Token Renew Failed');
      await this.deleteLoginDetails();
      this.router.navigate(['/auth/login']);
    }
    return false;
  }

  setTokenToCookie(details: any) {
    if (details['XSRF-TOKEN'] && details['X-XSRF-TOKEN']) {
      const date = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
      this.cookieService.set('XSRF-TOKEN', details['XSRF-TOKEN'], date, "/");
      this.cookieService.set('X-XSRF-TOKEN', details['X-XSRF-TOKEN'], date, "/");
    }
  }

  async deleteLoginDetails() {
    this.cookieService.delete('XSRF-TOKEN', '/');
    this.cookieService.delete('X-XSRF-TOKEN', '/');
    this.cookieService.deleteAll('/');
    await this.commonService.storage.clear();
  }

  renewToken() {
    return this.http.post<any>(`${this.URL}/cdp/auth/token/renew`, {});
  }

  //Auth
  signup(data: any) {
    return this.http.post<any>(`${this.URL}/cdp/auth/signup`, data);
  }

  login(data: any) {
    return this.http.post<any>(`${this.URL}/cdp/auth/login`, data);
  }

  logout() {
    return this.http.post<any>(`${this.URL}/cdp/auth/logout `, {});
  }

  confirmRegistration(data: any) {
    return this.http.post<any>(`${this.URL}/cdp/auth/signup/confirm`, data);
  }

  resetPassword(data: any) {
    return this.http.post<any>(`${this.URL}/cdp/auth/forgot-password`, data);
  }

  resendConfirmation(data: any) {
    return this.http.post<any>(`${this.URL}/cdp/auth/forgot-password/resend`, data);
  }

  confirmForgotPassword(data: any) {
    return this.http.post<any>(`${this.URL}/cdp/auth/forgot-password/confirm`, data);
  }
  createPassword(data: any) {
    return this.http.post<any>(`${this.URL}cdp/auth/set-password`, data);
  }
}
