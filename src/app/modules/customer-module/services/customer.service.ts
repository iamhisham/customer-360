import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  URL: string = environment.URL;
  customerDetails: any = {};
  customerNameLogo: any;

  constructor(private http: HttpClient) { }

  getAdminRecentviewed(params: any) {
    return this.http.get(`${this.URL}/cdp/customer-view-history/unique-customer`, { params });
  }

  getCustomerSearchDetails(params: any) {
    return this.http.get(`${this.URL}/cdp/customers/search`, { params });
  }

  getCustomerByUUID(customerUUID: any, fields: any, params: any = {}) {
    params = {
      embed: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/uuid/${customerUUID}`, { params });
  }

  getCustomerByIdWithAccountId(customerId: any, accountId: any, fields: any, params: any = {}) {
    params = {
      embed: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/accounts/${accountId}`, { params });
  }

  updateNickNameByAccountId(customerId: any, accountId: any, data: any) {
    return this.http.patch(`${this.URL}/cdp/customers/${customerId}/accounts/${accountId}/update-nick-name`, data);
  }

}
