import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OverviewService {

  URL: string = environment.URL;
  
  constructor(private http: HttpClient) { }

  getAllTaskByCustomerId(customerId: any, fields: any, params: any = {}) {
    params["status-ne"] = "CLOSED";
    params["fields"] = fields;
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/tasks`, { params });
  }
  
  getAllTaskByAccountId(customerId: any, accountId: any, fields: any, params: any = {}) {
    params["status-ne"] = "CLOSED";
    params["fields"] = fields;
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/accounts/${accountId}/tasks`, { params });
  }

}
