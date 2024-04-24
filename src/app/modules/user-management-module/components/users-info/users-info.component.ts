import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import { ConstantService } from 'src/app/service/constant.service';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import Swal from 'sweetalert2';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users-info',
  templateUrl: './users-info.component.html',
  styleUrls: ['./users-info.component.scss'],
})
export class UsersInfoComponent  implements OnInit {

  isInitTriggered: boolean = false;

  schedulerTableDetails: any = {
    name: "scheduler",
    pk: "id",
    search: "",
    pageSize: 10,
    needServerSidePagination: true,
    orderBy: "updatedAt desc",
    // embed: this.constService.CONST.SCHEDULER.EMBED_GET_ALL,
    fields: [
      { name: "Id", attr: "id", width: "90", type: 'LINK', filterType: 'ID' },
      { name: "Name", attr: "name", width: "185", filterType: 'TEXT' },
      { name: "Email", attr: "email", width: "135", filterType: 'ENUMS' },
      { name: "Phone Number", attr: "phoneNumber", width: "175", filterType: 'ENUMS', filterEnums: [], filterAttr: 'sourceSystemId', sortAttr: 'sourceSystem.name' },
      { name: "Status", attr: "status", width: "160", type: 'chip', className:'textCapitalize', filterType: 'ENUMS', filterEnums: [
          { value: "CONFIRMED", name: "Confirmed" },
      ], filterAttr: 'sourceSystemId' },
      { name: "Last Login", attr: "lastLogin", width: "175", filterType: 'DATETIME',},
      { name: "Updated At", attr: "updatedAt", width: "175", filterType: 'DATETIME',},
    ],
    actions: [
      { name: "Edit", attr: 'edit', getLink: (el: any) => '/scheduler/' + el.id },
      {
        name: "Activate",
        // clickFunction: (el: any) => this.schedularStatusChange(el),
        isVisible: (el: any) => el.status == "DISABLED"
      },
      {
        name: "Deactivate",
        // clickFunction: (el: any) => this.schedularStatusChange(el),
        isVisible: (el: any) => el.status == "SCHEDULED",
      },
      { name: "Delete", clickFunction: (el: any) => this.confirmDelete(el) },
    ],
    getRecord: (params: any) => this.getAllUserList(params),
    buildData: (sche: any) => {
      return sche.map((scheduleDetails: any) => {
        return {
          // id, name, email address, phone number, status, lastlogin, updatedAt,
          id: scheduleDetails.id,
          name: scheduleDetails.name,
          email: scheduleDetails.email,
          phoneNumber: scheduleDetails.phoneNumber,
          status: scheduleDetails.status,
          lastLogin: scheduleDetails.lastLogin,
          updatedAt: scheduleDetails.updatedAt,
          action: {
            edit: '/data-setup/scheduler/' + scheduleDetails.id,
          },
          link: {
            id: '/data-setup/scheduler/' + scheduleDetails.id,
          }
        };
      });
    }
  };

  @ViewChild('scheduler_Table') scheduler_Table: TableComponent | undefined;

  constructor(public commonService: CommonService, private userService: UsersService,
    private datePipe: DatePipe, private router: Router, private constService: ConstantService) {
  }

  ngOnInit() {}

  async getAllUserList(params : any) {
    return await this.userService.getAllUserList(params).toPromise();
  }

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
          // await this.schedulerService.deleteScheduler(data.sourceSystemId, data.id).toPromise();
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

  createUser() {

  }
}
