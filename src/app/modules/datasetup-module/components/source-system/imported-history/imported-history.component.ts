import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { log } from 'console';
import { DurationPipePipe } from 'src/app/shared/pipe/duration-pipe.pipe';
import { CommonService } from 'src/app/service/common.service';
import { ConstantService } from 'src/app/service/constant.service';
import { SchedulerService } from 'src/app/modules/datasetup-module/services/scheduler.service';
import { SourceSystemService } from 'src/app/modules/datasetup-module/services/source-system.service';
// import { CustomerServiceService } from 'src/app/service/customer-service.service';
// import { CustomerService } from 'src/app/service/customer.service';
import Swal from 'sweetalert2';
import * as saveAs from 'file-saver';
import { TableComponent } from 'src/app/shared/components/table/table.component';

@Component({
  selector: 'app-imported-history',
  templateUrl: './imported-history.component.html',
  styleUrls: ['./imported-history.component.scss'],
})
export class ImportedHistoryComponent implements OnInit {

  importHistoryTableDetails: any = {
    name: "import history",
    pk: "id",
    search: "",
    pageSize: 10,
    needServerSidePagination: true,
    orderBy: "startAt desc",
    embed: this.constService.CONST.SOURCE_SYSTEM_IMPORT_HISTORY.EMBED_GET_ALL,
    fields: [
      { name: "ID", attr: "id", width: "105", filterType: 'NUMBER' },
      { name: "Source System", attr: "sourceSystemName", width: '175', filterType: 'ENUMS', filterEnums: [], filterAttr: 'sourceSystemId', sortAttr: 'sourceSystem.name', },
      {
        name: "Import Type", attr: "type", width: "175", filterType: 'ENUMS', filterEnums: [
          { value: "CDP", name: "CDP" },
          { value: "SOURCE_SYSTEM", name: "Source system" },
        ]
      },
      {
        name: "Module Name", attr: "moduleName", width: "185", filterType: 'ENUMS', filterEnums: [
          { value: "cdp-customer", name: "CDP Customer" },
          { value: "cdp-order-and-fulfilment", name: "CDP Order and Fulfilment" },
          { value: "cdp-payment", name: "CDP Payment" },
          { value: "cdp-subscription", name: "CDP Subscription" },
          { value: "cdp-case", name: "CDP Case" },
          { value: "cdp-loyalty-program", name: "CDP Loyalty Program" },
          { value: "cdp-segments", name: "CDP Segments" },
          { value: "cdp-crm", name: "CDP CRM" },
          { value: "cdp-task", name: "CDP Task" },
          { value: "cdp-notification", name: "CDP Notification" },
          { value: "cdp-interaction-history", name: "CDP Interaction History" },

        ],
        sortAttr: 'moduleName',
      },
      { name: "Source System Object", attr: "sourceSystemObjectName", width: "230", filterType: 'TEXT', filterAttr: 'sourceSystemObjectName', sortAttr: 'sourceSystemObjectName', },
      {
        name: "Status", attr: "status", width: "135", filterType: 'ENUMS',
        filterEnums: [
          { value: "SUCCESS", name: "Success" },
          { value: "IN-PROGRESS", name: "In-Progress" },
          { value: "ERROR", name: "Error" }
        ]
      },
      { name: "Start At", attr: "startAt", type: "DATE", format: this.commonService.date_time_format, width: "160", filterType: 'DATETIME' },
      { name: "End At", attr: "endAt", type: "DATE", format: this.commonService.date_time_format, width: "160", filterType: 'DATETIME' },
      { name: "Duration", attr: "duration", width: "160", filterType: 'DURATION' },
    ],
    getRecord: (params: any) => this.getAllImportHistory(params),
    buildData: (sche: any) => {
      return sche.map((importHistoryDetails: any) => {
        return {
          id: importHistoryDetails.id,
          moduleName: importHistoryDetails.moduleName,
          sourceSystemName: importHistoryDetails.sourceSystem.name,
          status: importHistoryDetails.status,
          type: importHistoryDetails.type,
          fileName: importHistoryDetails.fileName,
          startAt: importHistoryDetails.startAt,
          endAt:importHistoryDetails.endAt,
          sourceSystemObjectName: importHistoryDetails.sourceSystemObjectName,
          duration: this.durationPipe.transform(importHistoryDetails.duration),
          action: {
            viewhistory: '/data-setup/scheduler/' + importHistoryDetails.id + '/history',
          }
        };
      });
    },
    actions: [
      { name: "View Result", isValid: (el: any) => el.status == 'SUCCESS', clickFunction: (el: any) => this.getImportHistoryResults(el) },
      { name: "View Error", isValid: (el: any) => el.status == 'ERROR', clickFunction: (el: any) => this.showErrorMessage(el) },
      { name: "View Audit Log", isValid: (el: any) => el.status != 'ERROR', clickFunction: (el: any) => this.navigateToAuditLog(el) },
      { name: "Download", isValid: (el: any) => el.fileName, clickFunction: (el: any) => this.downloadUploadedFile(el) }
      ///change file name in download

    ],
  };


  viewResultsTableDetails: any = {
    name: "result",
    pk: "id",
    search: "",
    pageSize: 5,
    needServerSidePagination: true,
    fields: [
      { name: "Module Name", attr: "moduleName", width: "135", disableSort: true },
      { name: "Object Name", attr: "objectName", width: "135", disableSort: true },
      { name: "Created", attr: "create", width: "105", disableSort: true },
      { name: "Updated", attr: "update", width: "105", disableSort: true },
      { name: "Total", attr: "total", width: "105" },
    ],
    getRecord: (params: any) => this.viewResults.data,
    buildData: (sche: any) => {
      return sche.map((importHistoryDetails: any) => {
        return {
          moduleName: importHistoryDetails.moduleName,
          objectName: importHistoryDetails.objectName,
          create: importHistoryDetails.create,
          update: importHistoryDetails.update,
          total: importHistoryDetails.total
        };
      });
    },
  };


  importData: any = {
    isResultModal: false,
    isErrorModal: false
  };
  viewResults: any = [];
  isInitTriggered: boolean = false;
  @ViewChild('importhistory_table') importhistory_table: TableComponent | undefined;

  constructor(private schedulerService: SchedulerService, public constService: ConstantService, public router: Router, public commonService: CommonService, private sourceSystemService: SourceSystemService, public datePipe: DatePipe, public durationPipe: DurationPipePipe) { }

  ngOnInit() {
    this.init();
  }

  async init() {
    if (this.isInitTriggered) return;
    this.isInitTriggered = true;
    await this.loadFilterData();
  }

  async loadFilterData() {

    const [sourceSystemList]: any = await Promise.all([
      this.sourceSystemService.getAllSourceSystemsIdAndName(),
    ]);
    this.importHistoryTableDetails.fields[1].filterEnums = sourceSystemList.map((obj: any) => ({ value: obj.id, name: obj.name }));
  }

  async getAllImportHistory(params: any) {
    return await this.sourceSystemService.getAllImportedData(params).toPromise();
  }

  async getImportHistoryResults(el: any) {
    this.viewResults = await this.sourceSystemService.getAllImportedDataByID(el.id).toPromise();
    this.viewResults.data = this.changeToTableFormat(this.viewResults.result);
    this.importData.isResultModal = true;
  }

  changeToTableFormat(result: any) {
    result = JSON.parse(result);
    let list: any = Object.keys(result).map((key: any) => ({ objectName: key, create: result[key].create, update: result[key].update, total: result[key].create + result[key].update }));
    list.map((data: any) => data.moduleName = this.viewResults.moduleName);
    return list;
  }

  async showErrorMessage(el: any) {
    let result: any = await this.sourceSystemService.getAllImportedDataByID(el.id).toPromise();
    this.importData.errorMessage = result.errorMessage;
    this.importData.errorCode = result.errorCode;
    this.importData.isErrorModal = true;
  }

  closeAllModel() {
    this.importData.isErrorModal = false;
    this.importData.isResultModal = false;
  }

  // downloadByImportHistoryId
  downloadUploadedFile(el: any) {
    try {
      this.commonService.showLoader();
      this.sourceSystemService.downloadByImportHistoryId(el.id).subscribe(
        (data: any) => {
          saveAs(data, `${el.fileName}`);
          this.commonService.hideLoader();
          Swal.fire({
            icon: 'success',
            title: 'File Download Successfully!',
            showConfirmButton: false,
            timer: 1500
          });
        },
        (e: any) => {
          this.commonService.hideLoader();
          this.commonService.toster.error((e.error?.error?.message || e.message || e) || 'File export Failed');
          console.error('Failed:', e);
        }
      );
    } catch (e: any) {
      this.commonService.hideLoader();
      this.commonService.toster.error('An error occurred: ' + (e.error?.error?.message || e.message || e));
    }
  }

  downloadimportData(el: any) {
    console.log(el);
  }
  navigateToAuditLog(el: any) {
    this.commonService.hideLoader();
    this.router.navigate([`data-setup/source-system/imported-history/${el.id}/audit-log`]);
  }
}
