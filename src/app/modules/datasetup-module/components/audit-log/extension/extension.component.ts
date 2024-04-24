import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DurationPipePipe } from 'src/app/shared/pipe/duration-pipe.pipe';
import { AuditLogService } from 'src/app/modules/datasetup-module/services/audit-log.service';
import { CommonService } from 'src/app/service/common.service';
import { TableComponent } from 'src/app/shared/components/table/table.component';

@Component({
  selector: 'app-extension',
  templateUrl: './extension.component.html',
  styleUrls: ['./extension.component.scss'],
})
export class ExtensionComponent implements OnInit {

  @ViewChild('extenstion_table') extenstion_table: TableComponent | undefined;

  extenstionTableDetails: any = {
    name: "audit log extension",
    pk: "id",
    search: "",
    pageSize: 10,
    needServerSidePagination: true,
    orderBy: "eventDate desc",
    embed: '(sourceSystemAudit[],sourceSystemAudit.sourceSystem[name],sourceSystemAudit.scheduler[name])',
    fields: [
      { name: "Id", attr: "id", filterType: 'ID' },
      { name: "Event Type", attr: "eventType", width: "175", filterType: 'TEXT' },
      { name: "Module Name", attr: "moduleName", width: "185", disableSort: true },
      { name: "Cdp Object Name", attr: "cdpObjectName", width: "175", disableSort: true },
      { name: "Cdp Object Id", attr: "cdpObjectId", width: "175", filterType: 'TEXT' },
      { name: "Customer Id", attr: "customerId", width: "175", filterType: 'TEXT' },
      { name: "Customer Name", attr: "customerName", width: "175", disableSort: true },
      { name: "Account Id", attr: "accountId", width: "175", filterType: 'TEXT' },
      { name: "Event Date", attr: "eventDate", filterType: 'DATE', type: "DATE", format: this.commonService.date_time_format },
    ],
    actions: [
      { name: "View Payload", attr: 'viewdetails', clickFunction: (el: any) => this.getAuditResults(el) },
      {
        name: "View Changes",
        clickFunction: (el: any) => this.viewChangesDetails(el),
        // isVisible: (el: any) => el.eventType == "UPDATE"
      },
      {
        name: "View Change History", attr: 'viewchangehistory',
        clickFunction: (el: any) => this.viewChangesHistoryDetails(el),
      },
    ],
    getRecord: (params: any) => this.getAllAuditlogExtension(params),
    buildData: (sche: any) => {
      return sche.map((scheduleDetails: any) => {
        return {
          id: scheduleDetails.id,
          customerId: scheduleDetails.customerId,
          accountId: scheduleDetails.accountId,
          moduleName: scheduleDetails?.sourceSystemAudit?.moduleName,
          customerName: scheduleDetails.customerName,
          cdpObjectName: scheduleDetails?.sourceSystemAudit?.cdpObjectName,
          cdpObjectId: scheduleDetails.cdpObjectId,
          eventType: scheduleDetails.eventType,
          eventDate: scheduleDetails.eventDate,
          link: {
            // id: '/auditlog/' + scheduleDetails.id
          },
        };
      });
    }
  };


  isModal = 'NONE';
  auditLogId: any = {
    "id": 2,
    "eventType": "UPDATE",
    "eventDate": "2024-03-22T11:15:33.000Z",
    "sourceSystem": "Dotmobile",
    "changeHistory": [
      {
        "attr": "name",
        "prev": "Sathish Kumar",
        "current": "Sathish"
      },
      {
        "attr": "occupation",
        "prev": "Software Engineer",
        "current": "Software Tester"
      },
      {
        "attr": "dateOfBirth",
        "prev": "1990-01-01",
        "current": "1900-01-01"
      },
      {
        "attr": "isHomeOwner",
        "prev": true,
        "current": false
      },
      {
        "attr": "militaryService",
        "prev": "No",
        "current": "NO"
      },
      {
        "attr": "hasOptedOutProfiling",
        "prev": false,
        "current": true
      }
    ]
  }

  viewChanges: any;
  changeData: any;
  expandedItems: any[] = [];
  viewResults: any = {
    isViewResultsModal: false
  }
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
  constructor(public durationPipe: DurationPipePipe, public datePipe: DatePipe, private auditLogService: AuditLogService, private route: ActivatedRoute, public commonService: CommonService, private auditlogService: AuditLogService) {
    this.auditLogId = this.route.snapshot.params['id'];
  }

  ngOnInit() { }

  async getAllAuditlogExtension(params: any) {
    return await this.auditlogService.getAllAuditLogExtenstion(this.auditLogId, params).toPromise();
  }

  async viewChangesDetails(data: any) {
    this.commonService.showLoader();
    this.viewChanges = (await this.auditlogService.getViewResult(this.auditLogId, data.id).toPromise() as any).data;
    this.commonService.hideLoader();
    this.isModal = 'VIEW';
  }
  async viewChangesHistoryDetails(data: any) {
    try {
      this.commonService.showLoader();
      this.changeData = (await this.auditlogService.getViewResultChangesHistroy(data.cdpObjectName, data.cdpObjectId).toPromise() as any).data;
      this.toggleModuleVisibility(data);
      this.isExpanded(data);
      this.commonService.hideLoader();
      this.isModal = 'HISTORY';
    }
    catch (err: any) {
      this.commonService.hideLoader();
      this.commonService.toster.error((err.error?.error?.message || err.message || err));
    }
  }
  toggleModuleVisibility(change: any) {
    const index = this.expandedItems.findIndex(item => item.id == change.id);
    if (index === -1) {
      this.expandedItems.push({
        id: change.id,
      });
    } else {
      this.expandedItems.splice(index, 1);
    }
  }
  expandAll() {
    this.changeData.forEach((change: any) => {
      if (!this.isExpanded(change)) {
        this.toggleModuleVisibility(change);
      }
    });
  }
  isAnyExpanded(): boolean {
    return this.expandedItems.length > 0;
  }

  collapseAll() {
    this.expandedItems = [];
  }

  isExpanded(change: any): boolean {
    return this.expandedItems.some(item => item.id == change.id);
  }
  async getAuditResults(el: any) {
    this.commonService.showLoader();
    this.viewResults = await this.auditLogService.getAllAuditHistoryLogByID(this.auditLogId, el.id).toPromise();
    this.commonService.hideLoader();
    this.isModal = 'PAYLOAD'
  }
  changeToTableFormat(result: any) {
    let list: any = [{ moduleName: this.viewResults.moduleName, objectName: this.viewResults.cdpObjectName, create: result.create, update: result.update, total: result.create + result.update }];
    return list;
  }
  closeAllModel() {
    this.viewResults.isViewResultsModal = false;
  }
}
