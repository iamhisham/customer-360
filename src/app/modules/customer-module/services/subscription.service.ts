import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  URL: string = environment.URL;

  constructor(private http: HttpClient) { }

  getPaymentHistoryByCustomerId(customer_id: any, fields: any, params: any = {}) {
    params = {
      embed: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/subscriptions`, { params })
  }

  getPaymentHistoryByAccountId(customer_id: any, account_id: any, fields: any, params: any = {}) {
    params = {
      embed: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/subscriptions`, { params })
  }


  getAllSubscriptionsByCustomerId(customer_id: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/subscriptions`);
  }

  getSubscriptionsByCustomerId(customer_id: any, fields: string, params: any = {}) {
    params = {
      embed: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/subscriptions`, { params });
  }

  getSubscriptionsByCustomerIdWithAccountId(customer_id: any, account_id: any, fields: string, params: any = {}) {
    params = {
      status: 'ACTIVE,PENDING',
      embed: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/subscriptions`, { params });
  }
  // getSubscriptionsByCustomerIdWithAccountId1(customer_id: any, account_id: any, fields: string, params: any = {}) {
  //   params = {
  //     status: 'ACTIVE,PENDING',
  //     embed: fields
  //   }
  //   return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/subscriptions`, { params });
  // }

  getInvoiceStatusByCustomerId(customer_id: any, params = {}) {
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/invoices`, { params });
  }

  getInvoiceStatusByCustomerIdWithAcountId(customer_id: any, account_id: any, params = {}) {
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/invoices`, { params });
  }

  getInvoiceByCustomerId(customer_id: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/invoices`);
  }

  getInvoiceByCustomerIdWithAccountId(customer_id: any, account_id: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/invoices`);
  }

  // usage and balance
  getSummaryByCustomerIdWithsubscriptionId(customer_id: any, subscription_id: any, fields: any, params: any = {}) {
    params = {
      fields: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/subscriptions/${subscription_id}/summary`, { params });
  }

  getSummaryByCustomerIdandAccountIdWithsubscriptionId(customer_id: any, account_id: any, subscription_id: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/subscriptions/${subscription_id}/summary`);
  }



  getSubscriptionSummaryByCustomerIdAndSubscriptionId(customerId: any, subscriptionId: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/subscriptions/${subscriptionId}/summary`);
  }

  ////
  getSubscriptionSummaryByCustomerIdAndAccountIdAndSubscriptionId(customerId: any, accountId: any, subscriptionId: any,) {
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/accounts/${accountId}/subscriptions/${subscriptionId}/summary`);
  }

}
