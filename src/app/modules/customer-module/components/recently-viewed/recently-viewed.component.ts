import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../../../service/common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recently-viewed',
  templateUrl: './recently-viewed.component.html',
  styleUrls: ['./recently-viewed.component.scss'],
})
export class RecentlyViewedComponent implements OnInit {

  page: number = 1;
  limit: number = 12;
  hasMoreRecord: boolean = false;
  isInitTriggered: boolean = false;

  userlist: any = [];
  totalRecords: any;
  constructor(private customerService: CustomerService, public datePipe: DatePipe, public commonService: CommonService, private router: Router) { }


  ngOnInit() {
    this.init();
  }

  ionViewWillEnter() {
    this.init();
  }

  ionViewWillLeave() {
    this.isInitTriggered = false;
  }

  ngOnDestroy() {
    this.isInitTriggered = false;
  }

  async init() {
    this.userlist = [];
    if (this.isInitTriggered) return;
    this.isInitTriggered = true;
    await this.commonService.showLoader();
    await this.getAdminRecentviewed();
    await this.commonService.hideLoader();
  }

  async getAdminRecentviewed() {
    try {
      this.userlist = [];
      const result: any = await this.customerService.getAdminRecentviewed({ page: this.page, limit: this.limit }).toPromise();
      this.totalRecords = result._metadata.totalRecords;
      
      this.hasMoreRecord = result._links.next ? true : false;
      this.userlist = this.userlist.concat(result.data.map((data: any) => {
        let splits = data.customerName.split(' ');
        data.userNameLogo = splits[0].charAt(0) + splits[1].charAt(0);
        return data;
      }));
      if(this.userlist.length == 0) this.userlist= null;
    }
    catch (err: any) {
      this.commonService.toster.error(err.message | err);
    }
    this.commonService.hideLoader();
    await this.commonService.hideLoader();
  }

  async showMore() {
    this.commonService.showLoader();
    this.page++;
    await this.getAdminRecentviewed();
    this.commonService.hideLoader();
  }

  routeToRecentView(id: any) {
    this.router.navigate(['/customers/', id]);
  }
}
