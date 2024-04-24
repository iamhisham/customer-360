import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {

  URL: string = environment.URL;

  constructor(private http: HttpClient) { }

  //schedular
  getAllSchedular(params = {}) {
    return this.http.get(`${this.URL}/cdp/source-system/scheduler`, { params });
  }

  getSchedulerDetailsById(scheduler_id: any, params = {}) {
    params = {
      embed: '(sourceSystem)'
    }
    return this.http.get(`${this.URL}/cdp/source-system/scheduler/${scheduler_id}`, { params });
  }

  changeStatusActive(source_system_id: any, scheduler_id: any) {
    return this.http.patch(`${this.URL}/cdp/source-system/${source_system_id}/scheduler/${scheduler_id}/activate `, '');
  }

  changeStatusDeactive(source_system_id: any, scheduler_id: any) {
    return this.http.patch(`${this.URL}/cdp/source-system/${source_system_id}/scheduler/${scheduler_id}/deactivate`, '');
  }

  getAllSchedulerBySourceSystem(source_system_id: any, params: {}) {
    return this.http.get(`${this.URL}/cdp/source-system/${source_system_id}/scheduler`, { params });
  }
  getAllSchedulerData(params: {}) {
    return this.http.get(`${this.URL}/cdp/source-system/scheduler`, { params });
  }

  createScheduler(source_system_id: any, data: any) {
    return this.http.post(`${this.URL}/cdp/source-system/${source_system_id}/scheduler`, data);
  }

  updateScheduler(source_system_id: any, schedulerId: any, data: any) {
    return this.http.put(`${this.URL}/cdp/source-system/${source_system_id}/scheduler/${schedulerId}`, data);
  }

  deleteScheduler(source_system_id: any, schedulerId: any) {
    return this.http.delete(`${this.URL}/cdp/source-system/${source_system_id}/scheduler/${schedulerId}`);
  }

  getAllSchedularHistory(params: any = {}) {
    return this.http.get(`${this.URL}/cdp/source-system/scheduler-history`, { params });
  }

  getAllSchedularHistoryById(scheduler_id: any, params: any = {}) {
    return this.http.get(`${this.URL}/cdp/source-system/scheduler/${scheduler_id}/scheduler-history`, { params });
  }

  getSchedularHistoryBySchedulerIdSchedulerHistoryId(scheduler_id: any, scheduler_history_id: any) {
    return this.http.get(`${this.URL}/cdp/source-system/scheduler/${scheduler_id}/scheduler-history/${scheduler_history_id}`);
  }

  getSchedularHistory(history_id: any) {
    return this.http.get(`${this.URL}/cdp/source-system/scheduler-history/${history_id}`);
  }

  getSchedularHistoryError(history_id: any) {
    return this.http.get(`${this.URL}/cdp/source-system/scheduler-history/${history_id}`);
  }

}

