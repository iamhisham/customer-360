import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { log } from 'console';
import { forEach } from 'jszip';
import { DurationPipePipe } from 'src/app/shared/pipe/duration-pipe.pipe';
import { CommonService } from 'src/app/service/common.service';
import { SchedulerService } from 'src/app/modules/datasetup-module/services/scheduler.service';
import { SourceSystemService } from 'src/app/modules/datasetup-module/services/source-system.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-schedular-history',
  templateUrl: './schedular-history.component.html',
  styleUrls: ['./schedular-history.component.scss'],
})
export class SchedularHistoryComponent implements OnInit {


  schedularId: any;

  scheduler: any = {
    isResultModal: false
  }
  schedulerHistoryTableDetails: any = {
    name: "Scheduler History",
    pk: "id",
    search: "",
    pageSize: 10,
    needServerSidePagination: true,
    orderBy: "startAt desc",
    embed: '(sourceSystem[name,id],scheduler[name])',
    fields: [
      { name: "Id", attr: "id", type: 'CLICK', width: '115', filterType: 'ID', clickFunction: (el: any) => this.navigateToAuditLog(el) },
      { name: "Source System", attr: "sourceSystem", width: '175', filterType: 'ENUMS', filterEnums: [], filterAttr: 'sourceSystemId', sortAttr: 'sourceSystem.name' },
      { name: "Scheduler Name", attr: "schedulerName", width: '175', filterType: 'ENUMS', filterEnums: [], filterAttr: 'schedulerId', sortAttr: 'scheduler.name' },
      {
        name: "Status", attr: "status", width: '115', filterType: 'ENUMS',
        filterEnums: [
          { value: "SUCCESS", name: "SUCCESS" },
          { value: "IN-PROGRESS", name: "IN-PROGRESS" },
          { value: "ERROR", name: "ERROR" }
        ]
      },
      { name: "Start At", attr: "startAt",  type: "DATE", format: this.commonService.date_time_format, width: '175', filterType: 'DATETIME' },
      { name: "EndDate", attr: "endAt",  type: "DATE", format: this.commonService.date_time_format, width: '175', filterType: 'DATETIME' },
      { name: "Duration", attr: "duration", width: '175', filterType: 'DURATION' },
    ],
    getRecord: (params: any) => this.schedulerService.getAllSchedularHistoryById(this.schedularId, params).toPromise(),
    buildData: (sche: any) => {
      return sche.map((scheduleDetails: any) => {

        this.scheduler.sourceSystem = scheduleDetails.sourceSystem?.name || "Null",
          this.scheduler.schedulerName = scheduleDetails.scheduler?.name,
          this.scheduler.status = scheduleDetails.status
        return {
          id: scheduleDetails.id,
          sourceSystem: this.scheduler.sourceSystem,
          schedulerName: scheduleDetails.scheduler?.name,
          status: scheduleDetails.status,
          startAt: scheduleDetails.startAt,
          endAt: scheduleDetails.endAt,
          duration: this.durationPipe.transform(scheduleDetails.duration),

        };
      });
    },
    actions: [
      { name: "View Result", isValid: (el: any) => el.status == 'SUCCESS', clickFunction: (el: any) => this.getViewResults(el) },
      { name: "View Error", isValid: (el: any) => el.status == 'ERROR', clickFunction: (el: any) => this.getViewResults(el) },
      { name: "View Audit Log", isValid: (el: any) => el.status != 'ERROR', clickFunction: (el: any) => this.navigateToAuditLog(el) },
    ]
  };

  viewResultsTableDetails: any = {
    name: "result",
    pk: "id",
    search: "",
    pageSize: 5,
    needServerSidePagination: true,
    fields: [
      { name: "Module Name", attr: "moduleName", width: "135", disableSort: true },
      // { name: "Object Name", attr: "objectName", width: "135", disableSort: true },
      { name: "Created", attr: "create", width: "105", disableSort: true },
      { name: "Updated", attr: "update", width: "105", disableSort: true },
      { name: "Total", attr: "total", width: "105" },
    ],
    getRecord: (params: any) => this.viewResults.data,
    buildData: (sche: any) => {
      return sche.map((importHistoryDetails: any) => {
        return {
          moduleName: importHistoryDetails.moduleName,
          // objectName: importHistoryDetails.objectName,
          create: importHistoryDetails.create,
          update: importHistoryDetails.update,
          total: importHistoryDetails.total
        };
      });
    },
  };

  schedularHistory: any = {};
  sourceSystemList = [];
  schdulerDetails: any;
  viewResults: any = {};

  viewModal = 'NONE';
  constructor(private sourceSystemService: SourceSystemService, public durationPipe: DurationPipePipe, public datePipe: DatePipe, private router: Router, public commonService: CommonService, private route: ActivatedRoute, private schedulerService: SchedulerService) { }

  ngOnInit() {
    this.schedularId = this.route.snapshot.params['scheduler_id'];
    this.init();
  }

  ionViewWillEnter() {
    this.init();
  }
  async init() {
    await Promise.all([
      this.getSchedulerDetailsById(),
    ]);
    await this.loadFilterData();
  }

  async getSchedulerDetailsById() {
    this.commonService.showLoader();
    this.schedulerService.getSchedulerDetailsById(this.schedularId).subscribe({
      next: (result: any) => {
        this.schdulerDetails = result;
      },
      error: (err: any) => {
        err = err.error || err;
      }
    });
    this.commonService.hideLoader();

  }


  async getViewResults(el: any) {
    this.commonService.showLoader();
    this.schedulerService.getSchedularHistory(el.id).subscribe({
      next: async (result: any) => {
        this.commonService.hideLoader();
        this.viewResults = result;
        if (result.status != 'ERROR') {
          this.viewModal = 'RESULT';
          this.viewResults.data = this.changeToTableFormat(JSON.parse(this.viewResults.result));
        }
        else {
          this.viewModal = 'ERROR';
          this.scheduler.errorMsg = result.errorMsg;
          this.scheduler.errorCode = result.errorCode;
        }

      },
      error: (err: any) => {
        this.commonService.hideLoader();
        this.commonService.toster.error((err.error?.error?.message || err.message || err));
      }
    });
  }

  changeToTableFormat(result: any) {
    let objList = ['cdp-customer', 'cdp-order-and-fulfilment'];
    let list: any;
    objList.forEach((data: any) => {

      list = Object.keys(result[data]).map((key: any) => {
        return { moduleName: key, create: result[data][key].create, update: result[data][key].update, total: result[data][key].create + result[data][key].update }
      });
    })

    return list;
  }

  closeAllModel() {
    this.viewModal = 'NONE';
  }

  async loadFilterData() {
    const [sourceSystemList, schedulerDetails]: any = await Promise.all([
      this.sourceSystemService.getAllSourceSystemsIdAndName(),
      this.schedulerService.getAllSchedular({ embed: "([id,name])", limit: 250 }).toPromise(),
    ]);
    this.schedulerHistoryTableDetails.fields[1].filterEnums = sourceSystemList.map((obj: any) => ({ value: obj.id, name: obj.name }));
    this.schedulerHistoryTableDetails.fields[2].filterEnums = schedulerDetails.data.map((obj: any) => ({ value: obj.id, name: obj.name }));
  }



  navigateToAuditLog(el: any) {
    this.router.navigate([`data-setup/scheduler/${this.schedularId}/history/${el.id}/audit-log`]);
  }


  // showErrorMessage(el: any) {
  //   this.commonService.showLoader();
  //   this.schedulerService.getSchedularHistoryError(el.id).subscribe({
  //     next: (result: any) => {
  //       this.commonService.hideLoader();
  //       Swal.fire({
  //         icon: "error",
  //         title: "ERROR",
  //         text: result.errorMsg,
  //       });
  //     },
  //     error: (err: any) => {
  //       this.commonService.hideLoader();
  //       Swal.fire({
  //         icon: "error",
  //         title: "Oops...",
  //         text: err.error?.error?.message || err.message || err,
  //       });
  //     }
  //   });
  // }
}

