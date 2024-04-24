import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  URL = environment.URL;
  constructor(private http: HttpClient) { }

  getAllUserList(params: any = {}) {
    return this.http.get(`${this.URL}/cdp/user-mgnt/users`, { params });
  }

  getAllUserGroups(params: any = {}) {
    return this.http.get(`${this.URL}/cdp/user-mgnt/user-groups`, { params });
  }

  getAllUserRoleList(params: any = {}) {
    return this.http.get(`${this.URL}/cdp/user-mgnt/role-hierarchies`, { params });
  }

  // getAllUserRoleList(params: any = {}) {
  //   return this.http.get(`${this.URL}/cdp/user-mgnt/role-hierarchies`, { params });
  // }

}
