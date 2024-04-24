import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AuditLogService } from 'src/app/modules/datasetup-module/services/audit-log.service';
import { CommonService } from 'src/app/service/common.service';
import { SourceSystemService } from 'src/app/modules/datasetup-module/services/source-system.service';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { NotificationService } from 'src/app/modules/notification-module/services/notification.service';
import { text } from 'node:stream/consumers';

@Component({
  selector: 'app-advance-audit-log-search',
  templateUrl: './advance-audit-log-search.component.html',
  styleUrls: ['./advance-audit-log-search.component.scss'],
})
export class AdvanceAuditLogSearchComponent implements OnInit {

  isInitTriggered: boolean = false;
  isShowZeroAtributes :any = false;

  cdpAdvanceAuditLog: any = {
    moduleName: '',
    cdpObjectName: '',
    objectId: '',
    attribute: [],
    type: 'CUSTOMER',
    isOpen: false
  };

  filterSearch: any = {
    moduleName: '',
    cdpObjectName: '',
    attribute: '',
    cdpAttributeList: []
  };

  isAdvanceSearchWithAttribute: boolean = false;
  isAdvanceModalSettingOpen: boolean = false;

  cdpObjectList: any = [];
  cdpAttributeList: any = [];
  cdpDataModuleList: any = null;
  expandedItems: any[] = [];

  customerBasedAuditLog: any = {}

  cdpModuleList: any = [
    { name: 'Customer', attr: 'customer' },
    { name: 'Subscription', attr: 'subscription' },
    { name: 'Segments', attr: 'segments' },
    { name: 'Task', attr: 'task' },
    { name: 'Order and Fulfilment', attr: 'order-and-fulfilment' },
    { name: 'Interaction History', attr: 'interaction-history' },
    { name: 'Case', attr: 'case' },
    { name: 'Loyalty Program', attr: 'loyalty-program' },
    { name: 'Payment', attr: 'payment' },
    { name: 'Notification', attr: 'notification' },
    { name: 'CRM', attr: 'crm' }
  ];

  advanceSearchDetails: any = {
    name: "changes",
    pk: "id",
    needServerSidePagination: false,
    pageSize: 10,
    orderBy: "eventDate desc",
    fields: [
      { name: "ID", attr: "id", width: 85 },
      { name: "Source System Name", attr: "sourceSystem", width: 150, className: "textCapitalize" },
      { name: "Event Type", attr: "eventType", width: 135, className: "textCapitalize" },
      { name: "Event Date", attr: "eventDate", width: 135, type: "DATE", format: this.commonService.date_time_format },
      { name: "Attribute Name", attr: "attr", className: "textCapitalize", type: 'chip', width: 135 },
      { name: "Previous Name", attr: "prev", className: "textCapitalize", width: 150 },
      { name: "Current Value", attr: "current", className: "textCapitalize", width: 150 }
    ],
    getRecord: (params: any) => this.advanceSearchApiCall(params)
  };
  @ViewChild('advance_grid') advanceGrid: TableComponent | undefined;


  constructor(private sourceSystemService: SourceSystemService, public commonService: CommonService, private auditLogService: AuditLogService, public datePipe: DatePipe, public notifiService: NotificationService) {
  }

  ngOnInit() {
    // this.init();
  }

  ionViewWillEnter() {
    this.init();
  }

  ionViewWillLeave() {
    this.isInitTriggered = false;
  }

  async init() {
    if (this.isInitTriggered) return;
    this.isInitTriggered = true;
    this.cdpAdvanceAuditLog.isOpen = true;
  }


  resetCdpAdvanceAuditLog() {
    this.cdpObjectList = [];
    this.cdpAttributeList = [];
    this.isAdvanceSearchWithAttribute = false;
    this.cdpAdvanceAuditLog = {
      moduleName: '',
      cdpObjectName: '',
      objectId: '',
      attribute: []
    };
  }

  async moduleList(event: any) {
    await this.getAllCdpObjects();
    this.cdpObjectList = this.cdpDataModuleList.filter((obj: any) => obj.module === event.detail.value);
  }

  selectEnum(event: any, value: any) {
    if (event && event?.target?.checked) {
      this.cdpAdvanceAuditLog.attribute.push(value);
    } else {
      this.cdpAdvanceAuditLog.attribute.splice(this.filterSearch.cdpAttributeList.findIndex((data: any) => data === value), 1);
    }

  }

  async getAllCdpObjects() {
    this.cdpDataModuleList = null;
    this.cdpDataModuleList = await this.sourceSystemService.getAllCdpObject().toPromise();
  }

  async selectAttribute(event: any) {
    this.cdpAdvanceAuditLog.cdpObjectName = event;
    this.cdpAttributeList = event.attributes;
    this.cdpAttributeList.unshift({ name: 'All' });
    this.cdpAdvanceAuditLog.attribute = 'All';
    // this.selectOrUnselectAllEnums(null, true);
  }

  async advanceSearch(params?: any) {
    try {
      this.validation();
      this.cdpDataModuleList = null;
      this.isAdvanceSearchWithAttribute = true;
      if(this.cdpAdvanceAuditLog.type != 'CUSTOMER') {
        if (this.cdpAdvanceAuditLog.attribute === 'All') {
          this.commonService.showLoader();
          this.cdpDataModuleList = await this.auditLogService.getAdvanceSearchWithOutAttribute(this.cdpAdvanceAuditLog.cdpObjectName, this.cdpAdvanceAuditLog.objectId).toPromise();
          console.log(this.cdpDataModuleList,'cdpDataModuleListcdpDataModuleList');
          this.commonService.hideLoader();
        } else if (this.cdpAdvanceAuditLog.attribute !== 'All') {
          this.advanceGrid?.init();
        }
      }else {
        console.log(this.customerBasedAuditLog,'asd');
        this.cdpDataModuleList = this.customerBasedAuditLog;
        // console.log(this.cdpDataModuleList);
        
        this.advanceGrid?.init();
      }
      this.cdpAdvanceAuditLog.isOpen = false
    } catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    }
    this.commonService.hideLoader();
  }

  async advanceSearchApiCall(params?: any) {
    try {
      if (this.isAdvanceSearchWithAttribute) {
        if (this.cdpAdvanceAuditLog.attribute)
          return this.auditLogService.getAdvanceSearchWithAttribute(this.cdpAdvanceAuditLog.cdpObjectName, this.cdpAdvanceAuditLog.attribute, this.cdpAdvanceAuditLog.objectId);
      }
      return undefined;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }

  selectOrUnselectAllEnums(event: any) {
    if (event && event?.target?.checked) {
      this.cdpAdvanceAuditLog.attribute = this.cdpAttributeList.map((data: any) => {
        return data.name;
      });
    } else {
      this.cdpAdvanceAuditLog.attribute = [];
    }
    // event.preventDefault();
    // event.stopImmediatePropagation();
  }


  validation() {
    if (!this.cdpAdvanceAuditLog.moduleName && this.cdpAdvanceAuditLog.type != 'CUSTOMER') throw { message: "Please select Module Name" };
    if (!this.cdpAdvanceAuditLog.cdpObjectName && this.cdpAdvanceAuditLog.type != 'CUSTOMER') throw { message: "Please select CDP Object Name" };
    if (!this.cdpAdvanceAuditLog.objectId && this.cdpAdvanceAuditLog.type != 'CUSTOMER') throw { message: "Please enter Object Id" };
    if (!this.cdpAdvanceAuditLog.attribute && this.cdpAdvanceAuditLog.type != 'CUSTOMER') throw { message: "Please enter Attribute" };
  }

  toggleModuleVisibility(change: any) {
    const index = this.expandedItems.findIndex((item: any) => item.id == change.id);
    if (index === -1) {
      this.expandedItems.push({
        id: change.id,
      });
    } else {
      this.expandedItems.splice(index, 1);
    }
  }

  isExpanded(change: any): boolean {
    return this.expandedItems.some(item => item.id == change.id);
  }

  switchSearchAdvanceType(type: any) {
    this.cdpAdvanceAuditLog.type = type;
  }

  async getCustomerDataById(customerID: any) {
    this.commonService.showLoader();
    this.customerBasedAuditLog = await this.auditLogService.getCustomerDataById(customerID).toPromise() as any;
    this.commonService.hideLoader();
  }

  async getCustomerWithModel(customerID: any, moduleName: any) {
    this.commonService.showLoader();
    this.customerBasedAuditLog = await this.auditLogService.getCustomerWithModel(customerID, moduleName).toPromise() as any;
    this.commonService.hideLoader();
  }

  async getCustomerWithModelAndObject(customerID: any, moduleName: any, cdpObjectName: any) {
    this.commonService.showLoader();
    this.customerBasedAuditLog = await this.auditLogService.getCustomerWithModelAndObject(customerID, moduleName, cdpObjectName).toPromise() as any;
    this.commonService.hideLoader();
  }

  showZeroAtributes() {
    this.isShowZeroAtributes = !this.isShowZeroAtributes;
  }
}
