import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  URL: string = environment.URL;

  constructor(private http: HttpClient) { }

  // auditlog
  getAllAuditLog(params: any = {}) {
    return this.http.get(`${this.URL}/cdp/source-system-audit`, { params });
  }

  getAllAuditLogByID(source_system_audit_id: any, params: any = {}) {
    params = {
      embed: '(scheduler[name])',
    }
    return this.http.get(`${this.URL}/cdp/source-system-audit/${source_system_audit_id}`, { params });
  }
  getAllAuditHistoryLogByID(auditId: any, auditExtId: any) {
    return this.http.get(`${this.URL}/cdp/source-system-audit/${auditId}/audit-ext/${auditExtId}`);
  }
  getAllAuditLogExtenstion(auditLogId: any, params: any = {}) {
    return this.http.get(`${this.URL}/cdp/source-system-audit/${auditLogId}/audit-ext`, { params });
  }

  getAdvanceSearchWithAttribute(cdpObjName: any, attributeName: any, objectId: any) {
    return this.http.get(`${this.URL}/cdp/source-system-audit/search/cdp-object-name/${cdpObjName}/attribute-name/${attributeName}/object-id/${objectId}`);
    // return this.http.get(`${this.URL}/cdp/source-system-audit/search/module-name/${moduleName}/attribute-name/${attributeName}/object-id/${objectId}`);
    // /cdp/source-system-audit/search/cdp-object-name/:_cdpObjectName/attribute-name/:_attributeName/object-id/:objectId
  }

  getAdvanceSearchWithOutAttribute(cdpObjName: any, objectId: any) {
    return this.http.get(`${this.URL}/cdp/source-system-audit/search/cdp-object-name/${cdpObjName}/object-id/${objectId}`);
    // return this.http.get(`${this.URL}/cdp/source-system-audit/search/module-name/${moduleName}/object-id/${objectId}`);
    // /cdp/source-system-audit/search/cdp-object-name/:_cdpObjectName/object-id/:objectId
  }

  getViewResult(source_system_audit_id: any, source_system_audit_ext_id: any) {
    return this.http.get(`${this.URL}/cdp/source-system-audit/${source_system_audit_id}/audit-ext/${source_system_audit_ext_id}/changes`);
  }
  getViewResultChangesHistroy(Object_Name: any, objectId: any) {
    return this.http.get(`${this.URL}/cdp/source-system-audit/search/cdp-object-name/${Object_Name}/object-id/${objectId}`);
  }

  getCustomerDataById(customerId: any) {
    return this.http.get(`${this.URL}/cdp/source-system-audit/search/customer/${customerId}`);
  }

  getCustomerWithModel(customerId: any, modelName: any) {
    modelName = modelName.trim(' '); 
    return this.http.get(`${this.URL}/cdp/source-system-audit/search/customer/${customerId}/model-name/${modelName}`);
  }

  getCustomerWithModelAndObject(customerId: any, _modelName: any, _objectName: any) {
    return this.http.get(`${this.URL}/cdp/source-system-audit/search/customer/${customerId}/model-name/${_modelName}/object-name/${_objectName}`);
  }
}
