import { Component, OnInit, ViewChild } from '@angular/core';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from '../../../../service/common.service';
import Swal from 'sweetalert2';
import { SourceSystemService } from '../../services/source-system.service';
import { SchedulerService } from '../../services/scheduler.service';
import { ConstantService } from '../../../../service/constant.service';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss'],
})
export class SchedulerComponent implements OnInit {
  isInitTriggered: boolean = false;

  schedulerTableDetails: any = {
    name: "scheduler",
    pk: "id",
    search: "",
    pageSize: 10,
    needServerSidePagination: true,
    orderBy: "updatedAt desc",
    embed: this.constService.CONST.SCHEDULER.EMBED_GET_ALL,
    fields: [
      { name: "Id", attr: "id", width: "90", type: 'LINK', filterType: 'ID' },
      { name: "Schedule name", attr: "name", width: "185", filterType: 'TEXT' },
      {
        name: "Occurance", attr: "occurrence", width: "135", type: 'chip', filterType: 'ENUMS',
        filterEnums: [
          { value: "ONE_TIME_SCHEDULE", name: "One-Time" },
          { value: "RECURRING_SCHEDULE", name: "Recurring" }
        ]
      },
      { name: "Source System", attr: "sourceSystem", width: "175", filterType: 'ENUMS', filterEnums: [], filterAttr: 'sourceSystemId', sortAttr: 'sourceSystem.name' },
      { name: "Schedule At", attr: "scheduledAt", width: "160", type: "DATE", format: this.commonService.date_time_format, filterType: 'DATETIME' },
      {
        name: "Schedule Type", attr: "scheduleType", width: "175", type: 'chip', className: "textCapitalize", filterType: 'ENUMS',
        filterEnums: [
          { value: "N/A", name: "N/A" },
          { value: "CRON-BASED", name: "Cron-Based" },
          { value: "RATE-BASED", name: "Rate-Based" }
        ]
      },
      {
        name: "Status", attr: "status", width: "115", className: "textCapitalize", filterType: 'ENUMS',
        filterEnums: [
          { value: "SCHEDULED", name: "Scheduled" },
          { value: "DISABLED", name: "Disabled" },
          { value: "COMPLETED", name: "Completed" }
        ]
      },
      {
        name: "Last Run Status", attr: "lastRunStatus", width: "185", className: "textCapitalize", filterType: 'ENUMS',
        filterEnums: [
          { value: "SUCCESS", name: "Success" },
          { value: "FAILED", name: "Failed" },
        ]
      },
      { name: "Last RunAt", attr: "lastRunAt", width: "160",  type: "DATE", format: this.commonService.date_time_format, filterType: 'DATETIME' },
      { name: "Next RunAt", attr: "nextRunAt", width: "160",  type: "DATE", format: this.commonService.date_time_format, filterType: 'DATETIME' },
      { name: "Updated At", attr: "updatedAt", width: "160",  type: "DATE", format: this.commonService.date_time_format, filterType: 'DATETIME' }
    ],
    actions: [
      { name: "Edit", attr: 'edit', getLink: (el: any) => '/scheduler/' + el.id },
      {
        name: "Deactivate",
        clickFunction: (el: any) => this.schedularStatusChange(el),
        isVisible: (el: any) => el.status == "SCHEDULED",
      },

      {
        name: "Activate",
        clickFunction: (el: any) => this.schedularStatusChange(el),
        isVisible: (el: any) => el.status == "DISABLED"
      },
      {
        name: "View error",
        clickFunction: (el: any) => this.getViewError(el),
        isVisible: (el: any) => el.lastRunStatus == "FAILED",
      },
      { name: "View History", attr: 'viewhistory', getLink: (el: any) => '/data-setup/scheduler/' + el.id + '/history' },
      { name: "Delete", clickFunction: (el: any) => this.confirmDelete(el) },
    ],
    getRecord: (params: any) => this.getAllSchedular(params),
    buildData: (sche: any) => {
      return sche.map((scheduleDetails: any) => {
        return {
          id: scheduleDetails.id,
          sourceSystem: scheduleDetails.sourceSystem.name,
          name: scheduleDetails.name,
          sourceSystemId: scheduleDetails.sourceSystem.id,
          occurrence: scheduleDetails.occurrence == 'ONE_TIME_SCHEDULE' ? 'One-Time' : 'Recurring',
          scheduledAt: scheduleDetails.scheduledAt || '-',
          scheduleType: scheduleDetails.scheduleType,
          cornExpression: scheduleDetails.cornExpression,
          rateExpression: scheduleDetails.rateExpression,
          status: scheduleDetails.status,
          lastRunStatus: scheduleDetails.lastRunStatus || '-',
          lastRunAt: scheduleDetails.lastRunAt || '-',
          nextRunAt: scheduleDetails.nextRunAt || '-',
          updatedAt: scheduleDetails.updatedAt || '-',
          action: {
            edit: '/data-setup/scheduler/' + scheduleDetails.id,
            viewhistory: '/data-setup/scheduler/' + scheduleDetails.id + '/history',
          },
          link: {
            id: '/data-setup/scheduler/' + scheduleDetails.id,
          }
        };
      });
    }
  };

  @ViewChild('scheduler_Table') scheduler_Table: TableComponent | undefined;

  sourceSystemDetails: any = {};
  viewModal = 'NONE';
  viewResults: any;
  constructor(private sourceSystemService: SourceSystemService, public commonService: CommonService,
    private datePipe: DatePipe, private schedulerService: SchedulerService, private router: Router, private constService: ConstantService) {
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

  async loadFilterData() {
    const sourceSystemList: any = await this.sourceSystemService.getAllSourceSystemsIdAndName();
    this.schedulerTableDetails.fields[3].filterEnums = sourceSystemList.map((obj: any) => {
      return { value: obj.id, name: obj.name };
    });
  }

  createScheduler() {
    this.router.navigate(['/data-setup/scheduler/create']);
  }

  async getAllSchedular(params: any) {
    return await this.schedulerService.getAllSchedular(params).toPromise();
  }

  async schedularStatusChange(data: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    });

    try {
      const result = await swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "This action will change the scheduler's status!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Change Status!',
        cancelButtonText: 'No, cancel!',
        confirmButtonColor: "#5164b8",
        cancelButtonColor: "#d33",
        reverseButtons: true
      });

      if (result.isConfirmed) {
        this.commonService.showLoader();
        if (data.status == "DISABLED") {
          await this.schedulerService.changeStatusActive(data.sourceSystemId, data.id).toPromise();
        } else if (data.status == "SCHEDULED") {
          await this.schedulerService.changeStatusDeactive(data.sourceSystemId, data.id).toPromise();
        }
        await this.scheduler_Table?.init();
        Swal.fire({
          title: 'Status Changed!',
          text: 'Scheduler status has been updated.',
          icon: 'success'
        });
      }
    } catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    } finally {
      this.commonService.hideLoader();
    }
  }
  // async schedularStatusChange(data: any) {


  //   try {
  //     this.commonService.showLoader();
  //     if (data.status == "DISABLED") {
  //       await this.schedulerService.changeStatusActive(data.sourceSystemId, data.id).toPromise();
  //     } else if (data.status == "SCHEDULED") {
  //       await this.schedulerService.changeStatusDeactive(data.sourceSystemId, data.id).toPromise();
  //     }
  //     await this.scheduler_Table?.init();
  //   } catch (e: any) {
  //     this.commonService.toster.error(e.error?.error?.message || e.message || e);
  //   } finally {
  //     this.commonService.hideLoader();
  //   }
  // }

  async confirmDelete(data: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    });
    await swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete Scheduler!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: "#5164b8",
      cancelButtonColor: "#d33",
      reverseButtons: true
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        this.commonService.showLoader();
        try {
          await this.schedulerService.deleteScheduler(data.sourceSystemId, data.id).toPromise();
          await this.scheduler_Table?.init();
          this.commonService.hideLoader();
          Swal.fire({
            title: 'Deleted!',
            text: 'Scheduler has been removed.',
            icon: 'success'
          });
        } catch (e: any) {
          this.commonService.hideLoader();
          this.commonService.toster.error(e.error?.error?.message || e.message || e || 'Delete Failed');
        }
      }
    });
  }


  async getViewError(el: any) {
    this.commonService.showLoader();
    this.schedulerService.getSchedulerDetailsById(el.id).subscribe({
      next: async (result: any) => {
        this.commonService.hideLoader();
        this.viewModal = 'ERROR';
        this.viewResults = result;
      },
      error: (err: any) => {
        this.commonService.hideLoader();
        this.commonService.toster.error((err.error?.error?.message || err.message || err));
      }
    });
  }


  closeAllModel() {
    this.viewModal = 'NONE';
  }
}
