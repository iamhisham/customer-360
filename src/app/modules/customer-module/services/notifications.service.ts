import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  URL: string = environment.URL;

  constructor(private http: HttpClient) { }

  getNotificationHistoryByCustomerId(customerId: any, fields: any, channels: string[], params: any = {}) {
    params = {
      embed: fields,
      ...(channels.length > 0 && { channel: `${channels.join(',')}` }),
      page: params.page,
      limit: params.limit,
    }
    return this.http.get(`${this.URL}/cdp/notifications/customers/${customerId}/histories/conversation`, { params });
  }

  getNotificationHistorNormalByCustomerId(customerId: any, fields: any, channels: string[], params: any = {}) {
    params = {
      embed: fields,
      ...(channels.length > 0 && { channel: `${channels.join(',')}` }),
      page: params.page,
      limit: params.limit,
    }
    return this.http.get(`${this.URL}/cdp/notifications/customers/${customerId}/histories`, { params });
  }

  getNotificationSegmentByCustomerId(customerId: any) {
    return this.http.get(`${this.URL}/cdp/customers/${customerId}/matched-segments`);
  }
}
