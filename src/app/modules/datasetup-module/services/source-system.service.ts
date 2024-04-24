import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SourceSystemService {

  URL: string = environment.URL;
  private sourceSystemNameIdList: any = null

  constructor(private http: HttpClient) { }

  async getAllSourceSystemsIdAndName(fetchLatest: boolean = false) {
    if (fetchLatest || !this.sourceSystemNameIdList) {
      const params = {
        embed: '([id,name,description])'
      };
      this.sourceSystemNameIdList = (await this.http.get(`${this.URL}/cdp/source-system`, { params }).toPromise() as any).data;
    }
    return this.sourceSystemNameIdList;
  }

  getExternalSourceSystems() {
    return this.http.get(`${this.URL}/cdp/source-system`);
  }

  getAllSourceSystemStore() {
    return this.http.get(`${this.URL}/cdp/source-system-store`);
  }
  createConnector(data: any) {
    data = {
      name: data.name,
      description: data.description,
      connectorId: data.connectorId,
    }
    return this.http.post(`${this.URL}/cdp/source-system`, data);
  }
  getAllInstalledConnectors() {
    return this.http.get(`${this.URL}/cdp/source-system`);
  }


  deleteInstalledConnectors(connector_id: any) {
    return this.http.delete(`${this.URL}/cdp/source-system/${connector_id}`);
  }


  getAllImportedData(params = {}) {
    return this.http.get(`${this.URL}/cdp/import-data`, { params });
  }

  getAllImportedDataByID(id: any) {
    return this.http.get(`${this.URL}/cdp/import-data/${id}`);
  }

  downloadByImportHistoryId(id: any) {
    const url = `${this.URL}/cdp/source-system/export/${id}`;
    const Accept = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv', 'application/x-prn', 'text/tab-separated-values'];
    return this.http.get(url, { headers: { Accept: Accept }, responseType: 'blob' });
  }

  getAllConnectorList(params: any) {
    return new Observable((subscriber: any) => {
      subscriber.next(
        [
          { id: 12, name: 'test1', description: 'description 123', category: 'connect 1' },
          { id: 13, name: 'test2', description: 'desc 23', category: 'connect 2' },
          { id: 14, name: 'test3', description: 'desc 123', category: 'connect 3' },
          { id: 15, name: 'test4', description: 'desc 123', category: 'connect 4' }
        ]
      );
      subscriber.complete();
    });
  }

  // importData - CDP
  createImportedDataByCDP(data: any, formData: any) {
    formData.append('cdpModuleName', data.cdpModuleName);
    formData.append('externalSourceId', data.externalSourceId);
    return this.http.post(`${this.URL}/cdp/source-system/import/excel`, formData);
  }

  // importData - SOURCE_SYSTEM
  createImportedDataBySourceSystem(data: any, formData: any) {
    formData.append('externalSourceId', data.externalSourceId);
    formData.append('sourceObjectName', data.sourceObjectName);
    return this.http.post(`${this.URL}/cdp/source-system/import/csv`, formData);
  }

  //download upload from srce system
  downloadUploadedFile(module_name: any) {
    const Accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const url = `${this.URL}/cdp/source-system/module/${module_name}/template/export`;
    return this.http.get(url, { headers: { Accept: Accept }, responseType: 'blob' });
  }


  getAllObjects() {
    return this.http.get(`${this.URL}/cdp/source-system/model-data`);
  }

  getConnectorsDetails(connector_id: any) {
    return this.http.get(`${this.URL}/cdp/source-system/${connector_id}`);
  }
  //get connector by UUID
  getAllConnectorsDetailsWithUuid(connector_uuid: any) {
    return this.http.get(`${this.URL}/cdp/source-system/uuid/${connector_uuid}`);
  }

  getFlowChartAttribute(source_system_id: any) {
    return this.http.get(`${this.URL}/cdp/source-system/${source_system_id}/source-name`);
  }

  updateConnectorsDetailsWithUuid(connector_uuid: any, data: any) {
    return this.http.put(`${this.URL}/cdp/source-system/uuid/${connector_uuid}`, data);
  }

  deleteConnectorsDetailsWithUuid(connector_uuid: any) {
    return this.http.delete(`${this.URL}/cdp/source-system/uuid/${connector_uuid}`)
  }

  uploadSwaggerFile(data: any) {
    return this.http.post(`${this.URL}/cdp/source-system/import-swagger`, data);
  }
  getAllCdpObject() {
    return this.http.get(`${this.URL}/cdp/source-system/cdp-model`);
  }

  getAllDataModel(di_connector_id: any) {
    return this.http.get(`${this.URL}/cdp/source-system/${di_connector_id}/data-model`);
  }

  getDataModel(data: any) {
    return this.http.post(`${this.URL}/cdp/source-system/data-model`, data);
  }

  createSourceSystem(data: any) {
    return this.http.post(`${this.URL}/cdp/source-system`, data);
  }

  testConnection(data: any) {
    return this.http.post(`${this.URL}/cdp/source-system/test-connection`, data);
  }


  // mapping
  getAutoMapping(configSourceSystem: any) {
    // return this.http.get(`${this.URL}/URL,${configSourceSystem}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data: any = [
          {
            "sourceName": "contact_point_address",
            "targets": [
              {
                "name": "contactPointAddress",
                "attributes": {
                  "id": "id",
                  "addressLine1": "address_line1",
                  "addressLine2": "address_line2",
                  "street": "street",
                  "city": "city",
                  "stateProvince": "state_province",
                  "state": "state",
                  "country": "country",
                  "postalCode": "postal_code",
                  "primaryContactPhone": "primary_contact_phone",
                  "geoLatitude": "geo_latitude",
                  "geoLongitude": "geo_longitude",
                  "isBusinessUse": "is_business_use",
                  "isPersonalUse": "is_personal_use",
                  "isUsedForBilling": "is_used_for_billing",
                  "isUsedForShipping": "is_used_for_shipping",
                  "isPrimaryAddress": "is_primary_address",
                  "isActive": "is_active",
                  "isDefault": "is_default",
                  "bestTimeContactStartTime": "best_time_contact_start_time",
                  "bestTimeContactEndTime": "best_time_contact_end_time",
                  "bestTimeContactTimezone": "best_time_contact_timezone",
                  "createdAt": "created_at",
                  "updatedAt": "updated_at"
                }
              }
            ],
            "updatedAtAttribute": "updated_at"
          },
          {
            "sourceName": "customer",
            "targets": [
              {
                "name": "customer",
                "attributes": {
                  "id": "id",
                  "firstName": "first_name",
                  "middleName": "sur_name",
                  "type": {
                    "attr": "type",
                    "type": "ENUM",
                    "condition": "MERGE_WITH_SPACE",
                    "values": {
                      "PROSPECT": "PROSPECT",
                      "CUSTOMER": "CUSTOMER"
                    }
                  },
                  "gender": {
                    "attr": "gender",
                    "type": "ENUM",
                    "condition": "MERGE_WITH_SPACE",
                    "values": {}
                  },
                  "dateOfBirth": "date_of_birth",
                  "language": "language",
                  "role": {
                    "attr": "role",
                    "type": "ENUM",
                    "condition": "MERGE_WITH_SPACE",
                    "values": {}
                  },
                  "bestTimeContactStartTime": "best_time_contact_start_time",
                  "bestTimeContactEndTime": "best_time_contact_end_time",
                  "bestTimeContactTimezone": "best_time_contact_timezone",
                  "childrenCount": "children_count"
                }
              },
              {
                "name": "contactPointEmail",
                "attributes": {
                  "id": "id",
                  "email": "email"
                }
              },
              {
                "name": "contactPointPhone",
                "attributes": {
                  "telephoneNumber": "phone",
                  "id": "id"
                }
              }
            ],
            "updatedAtAttribute": "updated_at"
          }
        ];
        resolve(data);
      }, 2000);
    })
  }

  getObjectMapping(configSourceSystem: any) {
    return this.http.get(`${this.URL}/cdp/ai/source-system/data-mapping/object-mapping, ${configSourceSystem}`);
  }

  getAttributeMapping(data: any) {
    // return this.http.post(`${this.URL}/cdp/ai/source-system/auto-data-mapping`, data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data: any = [

          {
            "sourceName": "account",
            "targets": [
              {
                "name": "account",
                "attributes": {
                  "externalSourceId": "id",
                  "accountNumber": "account_num",
                  "accountType": {
                    "attr": "account_type",
                    "type": "ENUM",
                    "values": {
                      "Telecom": "Telecom",
                      "Insurance": "Insurance"
                    }
                  },
                  "brandName": "brand_name",
                  "name": "name",
                  "description": "description",
                  "salutation": "salutation",
                  "photoUrl": "photo_url",
                  "site": "site",
                  "website": "website",
                  "fax": "fax",
                  "phone": "phone",
                  "industry": "industry",
                  "yearStarted": "year_started",
                  "annualRevenue": "annual_revenue",
                  "dunsNumber": "duns_number",
                  "numberOfEmployees": "number_of_employees",
                  "ownership": {
                    "attr": "ownership",
                    "type": "ENUM",
                    "values": {
                      "PRIVATE": "PRIVATE",
                      "PUBLIC": "PUBLIC",
                      "SUBSIDIARY": "SUBSIDIARY"
                    }
                  },
                  "rating": {
                    "attr": "rating",
                    "type": "ENUM",
                    "values": {
                      "HOT": "HOT",
                      "WARM": "WARM",
                      "COLD": "COLD"
                    }
                  },
                  "status": {
                    "attr": "status",
                    "type": "ENUM",
                    "values": {
                      "ACTIVE": "ACTIVE",
                      "INACTIVE": "INACTIVE"
                    }
                  },
                  "lastAccessed": "last_accessed",
                  "createdAt": "created_at",
                  "updatedAt": "updated_at",
                  "customerId": "customer_id"
                }
              }
            ],
            "updatedAtAttribute": "updated_at"
          }
        ];
        resolve(data);
      }, 2000);
    })
  }
}

