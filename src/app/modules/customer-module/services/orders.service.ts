import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  URL: string = environment.URL;

  constructor(private http: HttpClient) { }

  ///orders
  getPurchaseOverviewByCustomerId(customer_id: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/orders/summary`);
  }

  getPurchaseOverviewByAccountId(customer_id: any, account_id: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/orders/summary`);
  }

  getOrderById(order_id: any, fields: any, params: any = {}) {
    params = {
      embed: fields
    }
    return this.http.get(`${this.URL}/cdp/orders/${order_id}`, { params });
  }

  getPaymentsByInvoiceID(customer_id: any, account_id: any, invoiceIdList: any, params: any = {}) {
    params = {
      invoiceId: invoiceIdList,
      embed: '(paymentMethods)'
    }
    if (account_id) return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/payments`, { params });
    else return this.http.get(`${this.URL}/cdp/customers/${customer_id}/payments`, { params });
  }

  //order table
  getPurchaseHistory(customer_id: any, account_id: any, params: any = {}) {
    params["status-ne"] = "COMPLETED";
    if (account_id) return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/orders`, { params });
    else return this.http.get<any>(`${this.URL}/cdp/customers/${customer_id}/orders`, { params });
  }

  //dashboard
  getInvoiceOutstandingAmountByCustomerId(customerId: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/invoices/outstanding-amount`);
  }

  getInvoiceOutstandingAmountByCustomerIdWithAccountId(customerId: any, accountId: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/accounts/${accountId}/invoices/outstanding-amount`);
  }

  //overview
  getInvoiceStatusByCustomerId(customerId: any, fields: any, params: any = {}) {
    params = {
      fields: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/invoices`, { params });
  }

  getInvoiceStatusByCustomerIdWithAccountId(customerId: any, accountId: any, fields: any, params: any = {}) {
    params = {
      fields: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/accounts/${accountId}/invoices,`, { params });
  }

  getInvoiceStatusByCustomerIdWithAccountIdAndSubscriptionId(customerId: any, accountId: any, subscriptionId: any, status: any, fields: any, params: any = {}) {
    params = {
      status: status,
      fields: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/accounts/${accountId}/subscriptions/${subscriptionId}/invoices`, { params });
  }

  getLastPurchaseByCustomerId(customerId: any, fields: any, params: any = {}) {
    params = {
      limit: '1',
      fields: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/orders`, { params })
  }

  getOpenOrdersByCustomerId(customerId: any, fields: any, params: any = {}) {
    params = {
      status_code: 'DRAFT',
      fields: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/orders`, { params })
  }

  getOpenOrdersByCustomerIdAndAccountID(customerId: any, accountId: any, fields: any, params: any = {}) {
    params = {
      statusCode: 'DRAFT',
      fields: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/accounts/${accountId}/orders`, { params })
  }
  //



  ///billing

  getPaymentHistoryByCustomerIdWithStatus(customerId: any, fields: any, params: any = {}) {
    params = {
      status: 'PENDING',
      fields: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/invoices`, { params })
  }

  getPaymentHistoryByCustomerIdAndAccountIdWithStatus(customerId: any, accountId: any, fields: any, params: any = {}) {
    params = {
      status: 'PENDING',
      fields: fields
    }
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/accounts/${accountId}/invoices`, { params })
  }

  getBillHistoryByCustomerId(customerId: any, fields: any, params: any = {}) {
    params["status-ne"] = "PENDING";
    params["fields"] = fields;
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/invoices`, { params })
  }

  getBillHistoryByCustomerIdAndAccountIdWithStatus(customerId: any, accountId: any, fields: any, params: any = {}) {
    params["status-ne"] = "PENDING";
    params["fields"] = fields;
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/accounts/${accountId}/invoices`, { params })
  }

  getPaymentHistoryByInvoiceId(invoice_id: any) {
    const params = {
      embed: "paymentMethods"
    }
    return this.http.get(`${this.URL}/cdp/payments/invoices/${invoice_id}`, { params })
  }
  //////

  getOrdersByCustomerId(customerId: any, params: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/orders`, { params })
  }

  getOrdersByCustomerIdAndAccountId(customerId: any, accountId: any, params: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/accounts/${accountId}/orders`, { params })
  }

}
