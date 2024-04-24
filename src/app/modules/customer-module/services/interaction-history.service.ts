import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InteractionHistoryService {

  URL: string = environment.URL;
  
  constructor(private http: HttpClient) { }

  getOpportunitiesByCustomerId(customer_id: any) {
    return this.http.get(`${this.URL}/cdp/crm/customers/${customer_id}/opportunities`);
  }

}
