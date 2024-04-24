import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsageAndBalanceService {
  URL = environment.URL;
  constructor(private http: HttpClient) { }

  usageAndBalanceGrid() {
    return new Observable((subscriber: any) => {
      subscriber.next(
        [
          {
            "month": 'Jan',
            "consumedData": "44 GB",
            "predictionData": "76 GB"
          },
          {
            "month": 'Feb',
            "consumedData": "55 GB",
            "predictionData": "85 GB"
          },
          {
            "month": 'Mar',
            "consumedData": "57 GB",
            "predictionData": "101 GB"
          },
          {
            "month": 'Apr',
            "consumedData": "56 GB",
            "predictionData": "98 GB"
          },
          {
            "month": 'May',
            "consumedData": "61 GB",
            "predictionData": "87 GB"
          },
          {
            "month": 'Jun',
            "consumedData": "58 GB",
            "predictionData": "105 GB"
          },
          {
            "month": 'Jul',
            "consumedData": "63 GB",
            "predictionData": "91 GB"
          },
          {
            "month": 'Aug',
            "consumedData": "60 GB",
            "predictionData": "114 GB"
          },
          {
            "month": 'Sep',
            "consumedData": "66 GB",
            "predictionData": "94 GB"
          }
        ]
      );
      subscriber.complete();
    });
  }

  chartDetailsDaily(subscriptionId: number) {
    return {
      consumedData: [20, 35, 47, 56, 61, 18, 43, 30, 66],
      predictionData: [40, 85, 101, 38, 87, 35, 31, 14, 94],
      xAxis: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]
    }
  }

  chartDetailsMonthly(subscriptionId: number) {
    return {
      consumedData: [44, 55, 57, 56, 61, 58, 63, 60, 66],
      predictionData: [76, 85, 101, 98, 87, 105, 91, 114, 94],
      xAxis: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]
    }
  }
  
}
