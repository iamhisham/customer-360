import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { ModalController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { UserSegmentService } from 'src/app/modules/customer-module/services/user-segment.service';

@Component({
  selector: 'app-segment-view-popup-component',
  templateUrl: './segment-view-popup-component.component.html',
  styleUrls: ['./segment-view-popup-component.component.scss'],
})
export class SegmentViewPopupComponentComponent implements OnInit {

  @Input() usersegementRules: any;
  @Input() userName: any;
  @Input() type: any;
  isAdminScreen: boolean = false;
  campaignsDetail: any = [];
  isOpen = false;
  userProfileTableDetails: any = {
    name: "user",
    pk: 'id',
    needServerSidePagination: true,
    pageSize: 10,
    fields: [
      { name: "ID", attr: "id", width: "75", type: "LINK", disableSort: true},
      { name: "Name", attr: "name", width: "175", disableSort: true },
      { name: "Gender", attr: "gender", width: "75", className: "textCapitalize", disableSort: true },
      { name: "Language", attr: "language", width: "100", className: "textCapitalize", disableSort: true },
      { name: "Role", attr: "role", width: "100", className: "textCapitalize", disableSort: true },
      { name: "Phone Number", attr: "primary_telephone_number", width: "150", disableSort: true },
      { name: "Email", attr: "primary_email", width: "200", disableSort: true },
    ],
    actions: [
      { name: 'View', attr: "View" },
    ],
    getRecord: (params: any) => this.getUserBySegment(params),
    buildData: (userProfileList: any) => {
      return userProfileList.map((userprofile: any) => {
        return {
          id: userprofile.id,
          name: userprofile.name,
          gender: userprofile.gender,
          date_of_birth: this.datePipe.transform(userprofile.date_of_birth, this.commonService.date_format),
          language: userprofile.language,
          role: userprofile.role,
          primary_telephone_number: userprofile.primary_telephone_number,
          primary_email: userprofile.primary_email,
          link: {
            id: '/user-profile/' + userprofile.id,
          },
          action: {
            View: '/user-profile/' + userprofile.id,
          }
        };
      });
    }
  };

  @ViewChild('user_profile_grid') userProfileGrid: TableComponent | undefined;

  constructor(private commonService: CommonService, private datePipe: DatePipe,
    private modelcontroller: ModalController, private userSegmentService: UserSegmentService) { }

  ngOnInit() {
    this.init();
  }

  init() {
    this.userProfileGrid?.init();
  }

  async openModal(element: any) {
    this.isOpen = true;
    this.campaignsDetail = element;
  }

  cancel() {
    this.modelcontroller.dismiss();
  }

  getUserBySegment(params: any) {
    return this.userSegmentService.getUserSegementUsers({ rule_type: this.type, rules: this.usersegementRules, channels: ['EMAIL', 'WEB_PUSH', 'MOBILE_PUSH', 'SMS', 'IN_APP_MESSAGE'], params }).toPromise();
  }

}
