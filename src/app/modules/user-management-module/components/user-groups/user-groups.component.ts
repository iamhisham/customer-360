import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import Swal from 'sweetalert2';
import { UsersService } from '../../services/users.service';
import { Router } from '@angular/router';
import { ConstantService } from 'src/app/service/constant.service';

@Component({
  selector: 'app-user-groups',
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.scss'],
})
export class UserGroupsComponent  implements OnInit {


  isInitTriggered: boolean = false;

  schedulerTableDetails: any = {
    name: "scheduler",
    pk: "id",
    search: "",
    pageSize: 10,
    needServerSidePagination: true,
    // orderBy: "updatedAt desc",
    // embed: this.constService.CONST.SCHEDULER.EMBED_GET_ALL,
    fields: [
      // id, name, description, updatedBy, updatedAt, options (Edit, delete)
      { name: "Id", attr: "id", width: "90", type: 'LINK', filterType: 'ID' },
      { name: "Description", attr: "description", width: "185", filterType: 'TEXT' },
      { name: "Updated By", attr: "updatedBy", width: "135", filterType: 'ENUMS' },
      { name: "Updated At", attr: "updatedAt", width: "175", filterType: 'ENUMS', filterEnums: [], filterAttr: 'sourceSystemId', sortAttr: 'sourceSystem.name' },
    ],
    actions: [
      { name: "Edit", attr: 'edit', getLink: (el: any) => '/scheduler/' + el.id },
      { name: "Delete", clickFunction: (el: any) => this.confirmDelete(el) },
    ],
    getRecord: (params: any) => this.getAllUserGroups(params),
    buildData: (sche: any) => {
      return sche.map((scheduleDetails: any) => {
        return {
          // id, name, email address, phone number, status, lastlogin, updatedAt,
          id: scheduleDetails.id,
          description: scheduleDetails.description,
          updatedBy: scheduleDetails.updatedBy,
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

  async getAllUserGroups(params : any) {
    return await this.userService.getAllUserGroups(params).toPromise();
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
