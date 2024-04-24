import { Component, OnInit, ViewChild } from '@angular/core';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../../service/common.service';
import { SourceSystemService } from '../../services/source-system.service';
import { AuditLogService } from '../../services/audit-log.service';
import { SchedulerService } from '../../services/scheduler.service';
import { DurationPipePipe } from '../../../../shared/pipe/duration-pipe.pipe';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss'],
})
export class AuditLogComponent implements OnInit {

  filterSearch: any = {
    moduleName: '',
    cdpObjectName: '',
    attribute: '',
    cdpAttributeList: []
  };
  schedulerTableDetails: any = {
    name: "audit log",
    pk: "id",
    search: "",
    pageSize: 10,
    needServerSidePagination: true,
    filter: this.getDefaultFilterDetails(),
    orderBy: "startAt desc",
    embed: '(sourceSystem[name],scheduler[name])',
    fields: [
      { name: "ID", attr: "id", type: 'LINK', filterType: 'ID', width: '100', },
      { name: "Source System", attr: "sourceSystemName", width: '175', filterType: 'ENUMS', filterEnums: [], filterAttr: 'sourceSystemId', sortAttr: 'sourceSystem.name', },
      {
        name: "Import Type", attr: "type", width: "160", filterType: 'ENUMS',
        filterEnums: [
          { value: "IMPORT", name: "Import" },
          { value: "SCHEDULE", name: "Schedule" }
        ]
      },
      { name: "Scheduler", attr: "scheduler", width: '135', filterType: 'ENUMS', filterEnums: [], filterAttr: 'schedulerId', sortAttr: 'scheduler.name' },
      { name: "Scheduler History Id", attr: "schedulerHistoryId", width: '200', filterType: 'ID', filterAttr: 'sourceSystemSchedulerHistoryId', disableSort: true },
      { name: "Import Id", attr: "importDataId", width: '145', filterType: 'ID' },
      { name: "Cdp Object Name", attr: "cdpObjectName", width: '200', filterType: 'ENUMS', filterEnums: [] },
      { name: "Record Count", attr: "affectedRecordCount", width: '165', filterType: 'NUMBER' },
      { name: "Start At", attr: "startAt", width: '175', type: "DATE", format: this.commonService.date_time_format, filterType: 'DATETIME' },
      { name: "End At", attr: "endAt", width: '175', type: "DATE", format: this.commonService.date_time_format, filterType: 'DATETIME' },
      { name: "Duration", attr: "duration", width: '160', filterType: 'DURATION', sortAttr: 'duration' }
    ],
    actions: [
      { name: "View Result", clickFunction: (el: any) => this.getAuditResults(el) },
      { name: "View Details", attr: 'viewdetails' },
    ],
    getRecord: (params: any) => this.getAllAuditlog(params),
    buildData: (sche: any) => {
      return sche.map((scheduleDetails: any) => {
        return {
          id: scheduleDetails.id,
          sourceSystemName: scheduleDetails.sourceSystem?.name,
          type: scheduleDetails.type,
          scheduler: scheduleDetails.scheduler?.name || 'N/A',
          schedulerHistoryId: scheduleDetails?.sourceSystemSchedulerHistoryId || 'N/A',
          importDataId: scheduleDetails.importDataId || 'N/A',
          cdpObjectName: scheduleDetails.cdpObjectName,
          affectedRecordCount: scheduleDetails.affectedRecordCount,
          startAt: scheduleDetails.startAt,
          endAt: scheduleDetails.endAt,
          duration: this.durationPipe.transform(scheduleDetails.duration),
          link: {
            id: '/data-setup/audit-log/' + scheduleDetails.id + '/details/',
          },
          action: {
            viewdetails: '/data-setup/audit-log/' + scheduleDetails.id + '/details/',
          }
        };
      });
    }
  };

  viewResultsTableDetails: any = {
    name: "result",
    pk: "id",
    search: "",
    pageSize: 5,
    needServerSidePagination: false,
    fields: [
      { name: "Module Name", attr: "moduleName", width: "115", disableSort: true },
      { name: "Object Name", attr: "objectName", width: "145", disableSort: true },
      { name: "Created", attr: "create", width: "105", disableSort: true },
      { name: "Updated", attr: "update", width: "105", disableSort: true },
      { name: "Total", attr: "total", width: "105" },
    ],
    getRecord: (params: any) => this.viewResults.data,
    // buildData: (sche: any) => {
    //   return sche.map((importHistoryDetails: any) => {
    //     return {
    //       moduleName: importHistoryDetails.moduleName,
    //       objectName: importHistoryDetails.objectName,
    //       create: importHistoryDetails.create,
    //       update: importHistoryDetails.update,
    //       total: importHistoryDetails.total
    //     };
    //   });
    // },
  };

  sourceSystemDetails: any = {};

  viewResults: any = {
    isViewResultsModal: false
  }

  isInitTriggered: boolean = false;

  // cdpAdvanceAuditLog: any = {
  //   moduleName: '',
  //   cdpObjectName: '',
  //   objectId: '',
  //   attribute: []
  // };
  cdpDataModuleList: any = [];
  expandedItems: any[] = [];
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
  cdpObjectList: any = [];
  cdpAttributeList: any = [];

  // isAdvanceSearchWithAttribute: boolean = false;

  // advanceSearchDetails: any = {
  //   name: "Advance Search",
  //   pk: "id",
  //   needServerSidePagination: true,
  //   fields: [
  //     { name: "ID", attr: "id", width: 150 },
  //     { name: "Source System Name", attr: "sourceSystem", width: 150, className: "textCapitalize" },
  //     { name: "Event Type", attr: "eventType", width: 150, className: "textCapitalize" },
  //     { name: "Event Date", attr: "eventDate", width: 150 },
  //     { name: "Attribute Name", attr: "attr", className: "textCapitalize", type: 'chip' },
  //     { name: "Previous Name", attr: "prev", className: "textCapitalize", width: 150 },
  //     { name: "Current Value", attr: "current", className: "textCapitalize", width: 150 }
  //   ],
  //   getRecord: (params: any) => this.advanceSearchApiCall(params),
  //   buildData: (advanceSearchList: any) => {
  //     return advanceSearchList.map((advanceSearch: any) => {
  //       console.log(advanceSearch, 'fd');
  //       return {
  //         id: advanceSearch.id,
  //         sourceSystem: advanceSearch.sourceSystem,
  //         eventType: advanceSearch.eventType,
  //         eventDate: this.datePipe.transform(advanceSearch.eventDate, this.commonService.date_format),
  //         attr: advanceSearch.attr,
  //         prev: advanceSearch.prev,
  //         current: advanceSearch.current
  //       };
  //     });
  //   }
  // };
  // @ViewChild('advance_grid') advanceGrid: TableComponent | undefined;
  @ViewChild('scheduler_Table') scheduler_Table: TableComponent | undefined;

  constructor(public commonService: CommonService, public datePipe: DatePipe, private route: ActivatedRoute, private router: Router, public durationPipe: DurationPipePipe,
    private auditLogService: AuditLogService, private schedulerService: SchedulerService, private sourceSystemService: SourceSystemService) {

  }

  ngOnInit() {
    this.init();
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
    await this.loadFilterData();
  }

  getDefaultFilterDetails() {
    const result: any = {};

    const schedularId = this.route.snapshot.params['scheduler_id'];
    const historyId = this.route.snapshot.params['history_id'];
    const importId = this.route.snapshot.params['import_id'];
    if (importId) {
      result.importDataId = {
        attr: "importDataId",
        cond: "eq",
        type: "ID",
        value: importId
      }
    } else if (schedularId && historyId) {
      result.schedulerId = {
        attr: "schedulerId",
        cond: "eq",
        type: "ENUMS",
        selectedEnums: [schedularId]
      };
      result.sourceSystemSchedulerHistoryId = {
        attr: "sourceSystemSchedulerHistoryId",
        cond: "eq",
        type: "ID",
        value: historyId
      }
    }

    return result;
  }

  async loadFilterData() {
    const [sourceSystemList, schedulerDetails, cdpObjName]: any = await Promise.all([
      this.sourceSystemService.getAllSourceSystemsIdAndName(),
      this.schedulerService.getAllSchedular({ embed: "([id,name])", limit: 250 }).toPromise(),
      this.sourceSystemService.getAllCdpObject().toPromise()
    ]);
    this.schedulerTableDetails.fields[1].filterEnums = sourceSystemList.map((obj: any) => ({ value: obj.id, name: obj.name }));
    this.schedulerTableDetails.fields[3].filterEnums = [{ value: 'null', name: 'N/A' }, ...schedulerDetails.data.map((obj: any) => ({ value: obj.id, name: obj.name }))];
    this.schedulerTableDetails.fields[4].filterEnums = schedulerDetails.data.map((obj: any) => ({ value: obj.id, name: obj.name }));
    this.schedulerTableDetails.fields[6].filterEnums = cdpObjName.map((obj: any) => ({ value: obj.name, name: obj.name }));
  }

  async getAllAuditlog(params: any) {
    return await this.auditLogService.getAllAuditLog(params).toPromise();
  }

  async advanceSearchBtn() {
    this.router.navigate(['data-setup/audit-log/advance-search']);
  }

  // async getAllCdpObjects() {
  //   this.cdpDataModuleList = await this.sourceSystemService.getAllCdpObject().toPromise();
  // }

  // async moduleList(event: any) {
  //   await this.getAllCdpObjects();
  //   this.cdpObjectList = this.cdpDataModuleList.filter((obj: any) => obj.module === event);
  // }

  // async selectAttribute(event: any) {
  //   this.cdpAdvanceAuditLog.cdpObjectName = event.name;
  //   this.cdpAttributeList = event.attributes;
  //   this.cdpAttributeList.unshift({ name: 'All' });
  //   this.cdpAdvanceAuditLog.attribute = 'All';
  //   // this.selectOrUnselectAllEnums(null, true);
  // }

  // async advanceSearch(params?: any) {
  //   try {
  //     this.validation();
  //     this.cdpDataModuleList = [];
  //     this.isAdvanceSearchWithAttribute = true;
  //     if (this.cdpAdvanceAuditLog.attribute === 'All') {
  //       this.commonService.showLoader();
  //       this.cdpDataModuleList = (await this.auditLogService.getAdvanceSearchWithOutAttribute(this.cdpAdvanceAuditLog.cdpObjectName, this.cdpAdvanceAuditLog.objectId).toPromise() as any).data;
  //       this.commonService.hideLoader();
  //     } else if (this.cdpAdvanceAuditLog.attribute !== 'All') {
  //       this.advanceGrid?.init();
  //     }
  //   } catch (e: any) {
  //     this.commonService.toster.error(e.error?.error?.message || e.message || e);
  //   }
  //   this.commonService.hideLoader();
  // }

  // validation() {
  //   if (!this.cdpAdvanceAuditLog.moduleName) throw { message: "Please select Module List" };
  //   if (!this.cdpAdvanceAuditLog.cdpObjectName) throw { message: "Please select CDP Object Name" };
  //   if (!this.cdpAdvanceAuditLog.objectId) throw { message: "Please enter Object Id" };
  //   if (!this.cdpAdvanceAuditLog.attribute) throw { message: "Please enter Attribute" };
  // }

  // async advanceSearchApiCall(params?: any) {
  //   try {
  //     if (this.isAdvanceSearchWithAttribute) {
  //       if (this.cdpAdvanceAuditLog.attribute)
  //         return this.auditLogService.getAdvanceSearchWithAttribute(this.cdpAdvanceAuditLog.cdpObjectName, this.cdpAdvanceAuditLog.attribute, this.cdpAdvanceAuditLog.objectId);
  //     }
  //     return undefined;
  //   } catch (error: any) {
  //     console.error(error);
  //     throw error;
  //   }
  // }

  // toggleModuleVisibility(change: any) {
  //   const index = this.expandedItems.findIndex((item: any) => item.id == change.id);
  //   if (index === -1) {
  //     this.expandedItems.push({
  //       id: change.id,
  //     });
  //   } else {
  //     this.expandedItems.splice(index, 1);
  //   }
  // }




  async getAuditResults(el: any) {
    this.commonService.showLoader();
    this.viewResults = await this.auditLogService.getAllAuditLogByID(el.id).toPromise();
    this.viewResults.data = this.changeToTableFormat(this.viewResults.result);
    this.commonService.hideLoader();
    this.viewResults.isViewResultsModal = true;
  }

  isExpanded(change: any): boolean {
    return this.expandedItems.some(item => item.id == change.id);
  }

  changeToTableFormat(result: any) {
    let list: any = [{ moduleName: this.viewResults.moduleName, objectName: this.viewResults.cdpObjectName, create: result.create, update: result.update, total: result.create + result.update }];
    return list;
  }

  closeAllModel() {
    this.viewResults.isViewResultsModal = false;
  }

  // resetCdpAdvanceAuditLog() {
  //   this.cdpObjectList = [];
  //   this.cdpAttributeList = [];
  //   this.isAdvanceSearchWithAttribute = false;
  //   this.cdpAdvanceAuditLog = {
  //     moduleName: '',
  //     cdpObjectName: '',
  //     objectId: '',
  //     attribute: []
  //   };
  // }

  // selectOrUnselectAllEnums(event: any) {
  //   if (event && event?.target?.checked) {
  //     this.cdpAdvanceAuditLog.attribute = this.cdpAttributeList.map((data: any) => {
  //       return data.name;
  //     });
  //   } else {
  //     this.cdpAdvanceAuditLog.attribute = [];
  //   }
  //   // event.preventDefault();
  //   // event.stopImmediatePropagation();
  // }

  // selectEnum(event: any, value: any) {
  //   if (event && event?.target?.checked) {
  //     this.cdpAdvanceAuditLog.attribute.push(value);
  //   } else {
  //     this.cdpAdvanceAuditLog.attribute.splice(this.filterSearch.cdpAttributeList.findIndex((data: any) => data === value), 1);
  //   }

  // }

}
