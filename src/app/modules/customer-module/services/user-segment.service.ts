import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserSegmentService {

  URL: string = environment.URL;
  selectedRecommendation: any = {};

  constructor(private http: HttpClient) { }

  //usersegment
  getUserSegmentById(segment_id: any) {
    return this.http.get(`${this.URL}/cdp/segments/${segment_id}`);
  }

  getAllUserSegment(params: any = {}) {
    return this.http.get(`${this.URL}/cdp/segments`, { params });
  }

  getUserCountByRules(data: any) {
    return this.http.post(`${this.URL}/cdp/customers/count-by-rule`, data);
  }

  createUserSegment(data: any) {
    return this.http.post(`${this.URL}/cdp/segments`, data);
  }

  updateUserSegmentById(segment_id: any, data: any) {
    return this.http.put(`${this.URL}/cdp/segments/${segment_id}`, data);
  }

  deleteUserSegmentById(segment_id: any) {
    return this.http.delete(`${this.URL}/cdp/segments/${segment_id}`);
  }

  getUserSegementUsers(data: any) {
    return this.http.post(`${this.URL}/cdp/customers/customerinfo-by-rule`, data);
  }

  // recommedation
  getRecommendationUserSegement() {
    return new Observable((subscriber: any) => {
      subscriber.next(
        [
          {
            "name": "Young Female Android Users",
            "description": "This segment includes users who are females, aged between 18 to 24, and use Android devices. For example, a user with the attributes: age=22, gender=female, device os=Android."
          },
          {
            "name": "Male iOS Users",
            "description": "This segment includes male users who use iOS devices. For example, a user with the attributes: gender=male, device os=iOS."
          },
          {
            "name": "English Speaking Desktop Users",
            "description": "This segment includes users who use the desktop platform and have set English as their language. For example, a user with the attributes: language=English, platform=desktop."
          },
          {
            "name": "Tagged Mobile Users",
            "description": "This segment includes users who use mobile devices and have been tagged. For example, a user with the attributes: platform=mobile, tag=tagged."
          },
          {
            "name": "Samsung Users",
            "description": "This segment includes users who use Samsung devices. For example, a user with the attributes: device make=Samsung."
          }
        ]
      );
      subscriber.complete();
    });
    // const params = new HttpParams().set('count', '5');
    // return this.http.get(`${this.URL}/cdp/ai/user-segment/recommendation`,{ params });
  }

  createRecommendedUsersegment(data: any) {
    return new Observable((subscriber: any) => {
      subscriber.next(
        {
          "name": "Young Female Android Users",
          "description": "This segment includes users who are females, aged between 18 to 24, and use Android devices.",
          "rules": [
            [
              {
                "name": "Gender",
                "attr": "gender",
                "type": "enum",
                "value": "FEMALE",
                "cond": "="
              },
              {
                "name": "Age",
                "attr": "age",
                "type": "number",
                "cond": "BETWEEN",
                "start_value": "18",
                "end_value": "24"
              },
              {
                "name": "Device OS",
                "attr": "deviceOs",
                "type": "text",
                "value": "Android",
                "cond": "="
              }
            ]
          ]
        }

      );
      subscriber.complete();
    });
    // return this.http.post(`${this.URL}/cdp/ai/user-segment/create`, data);
  }



  getAllAttribute() {
    return new Observable((subscriber: any) => {
      subscriber.next([
        {
          "id": 35,
          "name": "age",
          "description": null,
          "type": "NUMBER",
          "createdAt": "2023-09-12T07:02:35.000Z",
          "updatedAt": "2023-09-12T07:02:35.000Z"
        },
        {
          "id": 34,
          "name": "custom_tag",
          "description": null,
          "type": "TEXT",
          "createdAt": "2023-07-26T10:29:41.000Z",
          "updatedAt": "2023-07-26T10:29:41.000Z"
        },
        {
          "id": 32,
          "name": "   jasd",
          "description": null,
          "type": "TEXT",
          "createdAt": "2023-03-29T06:12:19.000Z",
          "updatedAt": "2023-03-29T06:12:19.000Z"
        },
        {
          "id": 6,
          "name": "Total_Spent",
          "description": "Total Spent",
          "type": "NUMBER",
          "createdAt": "2023-02-27T05:31:18.000Z",
          "updatedAt": "2023-02-27T09:28:45.000Z"
        },
        {
          "id": 21,
          "name": "LTV",
          "description": "LTV (Life time value)",
          "type": "NUMBER",
          "createdAt": "2023-02-27T06:58:47.000Z",
          "updatedAt": "2023-02-27T06:58:47.000Z"
        },
        {
          "id": 20,
          "name": "AOV",
          "description": "AOV (Average order value)",
          "type": "NUMBER",
          "createdAt": "2023-02-27T06:58:26.000Z",
          "updatedAt": "2023-02-27T06:58:26.000Z"
        },
        {
          "id": 19,
          "name": "Cart_Amount",
          "description": "Cart Amount",
          "type": "NUMBER",
          "createdAt": "2023-02-27T06:57:55.000Z",
          "updatedAt": "2023-02-27T06:57:55.000Z"
        },
        {
          "id": 18,
          "name": "Cart_Items",
          "description": "Cart Items",
          "type": "TEXT",
          "createdAt": "2023-02-27T06:57:32.000Z",
          "updatedAt": "2023-02-27T06:57:32.000Z"
        },
        {
          "id": 7,
          "name": "Traffic_Source",
          "description": "Traffic Source",
          "type": "TEXT",
          "createdAt": "2023-02-27T05:32:02.000Z",
          "updatedAt": "2023-02-27T05:48:11.000Z"
        },
        {
          "id": 8,
          "name": "Landing_page_URL",
          "description": "Landing page URL",
          "type": "TEXT",
          "createdAt": "2023-02-27T05:32:22.000Z",
          "updatedAt": "2023-02-27T05:47:56.000Z"
        },
        {
          "id": 9,
          "name": "Time_Spent",
          "description": "Time Spent",
          "type": "NUMBER",
          "createdAt": "2023-02-27T05:32:42.000Z",
          "updatedAt": "2023-02-27T05:47:40.000Z"
        },
        {
          "id": 11,
          "name": "Is_Loggedin_User",
          "description": "Is Loggedin User",
          "type": "BOOLEAN",
          "createdAt": "2023-02-27T05:33:35.000Z",
          "updatedAt": "2023-02-27T05:47:31.000Z"
        },
        {
          "id": 12,
          "name": "Products_Viewed",
          "description": "Products Viewed",
          "type": "TEXT",
          "createdAt": "2023-02-27T05:33:55.000Z",
          "updatedAt": "2023-02-27T05:47:20.000Z"
        },
        {
          "id": 13,
          "name": "Product_Category",
          "description": "Product Category",
          "type": "TEXT",
          "createdAt": "2023-02-27T05:34:10.000Z",
          "updatedAt": "2023-02-27T05:47:12.000Z"
        },
        {
          "id": 15,
          "name": "Visits_Per_Week",
          "description": "Visits Per Week",
          "type": "NUMBER",
          "createdAt": "2023-02-27T05:34:57.000Z",
          "updatedAt": "2023-02-27T05:46:50.000Z"
        },
        {
          "id": 16,
          "name": "Last_Purchase_Date",
          "description": "Last Purchase Date",
          "type": "DATE",
          "createdAt": "2023-02-27T05:35:18.000Z",
          "updatedAt": "2023-02-27T05:46:34.000Z"
        },
        {
          "id": 17,
          "name": "User_Type",
          "description": "User Type",
          "type": "TEXT",
          "createdAt": "2023-02-27T05:35:32.000Z",
          "updatedAt": "2023-02-27T05:46:23.000Z"
        },
        {
          "id": 14,
          "name": "Product_Price",
          "description": "Product_Price",
          "type": "NUMBER",
          "createdAt": "2023-02-27T05:34:27.000Z",
          "updatedAt": "2023-02-27T05:34:27.000Z"
        },
        {
          "id": 10,
          "name": "Scroll",
          "description": "Scroll",
          "type": "NUMBER",
          "createdAt": "2023-02-27T05:33:06.000Z",
          "updatedAt": "2023-02-27T05:33:06.000Z"
        },
        {
          "id": 5,
          "name": "Text",
          "description": null,
          "type": "TEXT",
          "createdAt": "2023-02-24T05:30:19.000Z",
          "updatedAt": "2023-02-24T05:30:19.000Z"
        },
        {
          "id": 4,
          "name": "Number",
          "description": null,
          "type": "NUMBER",
          "createdAt": "2023-02-24T05:29:48.000Z",
          "updatedAt": "2023-02-24T05:29:48.000Z"
        },
        {
          "id": 3,
          "name": "Date",
          "description": null,
          "type": "DATE",
          "createdAt": "2023-02-24T05:29:21.000Z",
          "updatedAt": "2023-02-24T05:29:21.000Z"
        },
        {
          "id": 2,
          "name": "Date_time",
          "description": null,
          "type": "DATE_TIME",
          "createdAt": "2023-02-24T05:29:06.000Z",
          "updatedAt": "2023-02-24T05:29:06.000Z"
        },
        {
          "id": 1,
          "name": "VIP",
          "description": null,
          "type": "BOOLEAN",
          "createdAt": "2023-02-24T05:28:50.000Z",
          "updatedAt": "2023-02-24T05:28:50.000Z"
        }
      ]);
      subscriber.complete();
    });
  }
}

