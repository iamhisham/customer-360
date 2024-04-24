import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  URL = environment.URL;
  constructor(private http: HttpClient) { }

  getAllTickets(customer_id: any, account_id: any, params: any = {}) {
    if (account_id) return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/cases`, { params });
    else return this.http.get(`${this.URL}/cdp/customers/${customer_id}/cases`, { params });
  }

  getlogByCustomerIdAccountId(customer_id: any, account_id: any, case_id: any, params: any = {}) {
    params = {
      embed: '(caseActivityLogs)'
    }
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/cases/${case_id}`, { params })
  }

  getIncidentTicket(case_id: any, params: any = {}) {
    params = {
      type: 'INCIDENT'
    }
    return this.http.get(`${this.URL}/cdp/cases/${case_id}/related-cases`, { params })
  }

  getTaskByTicket(customer_id: any, account_id: any, case_id: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/tasks/case/${case_id}`)

  }
  getAllTicketsById(customer_id: any, account_id: any, case_id: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/cases/${case_id}`)
  }

  getTicketSummary(customer_id: any, account_id: any) {
    if (account_id) return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/cases/type/summary`);
    else return this.http.get(`${this.URL}/cdp/customers/${customer_id}/cases/type/summary`);
  }

  getAffectedTicketByAccountId(account_id: any) {
    return this.http.get(`${this.URL}/cdp/accounts/${account_id}/cases/type/summary`)
  }

  getAffectedSummary() {
    return this.http.get(`${this.URL}/cdp/cases/type/summary`)
  }

  getOrginTicketSummary(customer_id: any, account_id: any) {
    if (account_id) return this.http.get(`${this.URL}/cdp/customers/${customer_id}/accounts/${account_id}/cases/origin/summary`);
    else return this.http.get(`${this.URL}/cdp/customers/${customer_id}/cases/origin/summary`);
  }

  getOriginByAccountId(account_id: any) {
    return this.http.get(`${this.URL}/cdp/accounts/${account_id}/cases/origin/summary`)
  }
  getOriginSummary() {
    return this.http.get(`${this.URL}/cdp/cases/origin/summary`)
  }
}
