import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { ConstantService } from 'src/app/service/constant.service';
import { NotificationsService } from 'src/app/modules/customer-module/services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  @Input() customer: any;
  @Input() accountId: any;

  notificationHistory: any;
  segmentsList: any;
  customTags: any;
  selectedItems: string[] = [];
  pageLimit = 10;
  additionalHistory: any;
  notificationHistoryType: any = true;
  isModalOpen = false;
  constructor(public commonService: CommonService, private notificationsService: NotificationsService,
    private constService: ConstantService, public datePipe: DatePipe) { }

  ngOnInit() {
    this.init();
  }

  async init(accountId: any = this.accountId) {
    this.accountId = accountId;
    if (this.customer?.id) {
      await Promise.all([
        this.getNotificationHistory(),
        this.getNotificationSegmentByCustomerId(),

      ]);
    }
  }

  async getNotificationHistory() {
    this.notificationHistory = null
    if (this.notificationHistoryType) {
      this.notificationHistory = await this.notificationsService.getNotificationHistoryByCustomerId(this.customer.id, this.constService.CONST.NOTIFICATION.EMBED_NOTIFICATION_HISTROY, this.selectedItems, { page: 1, limit: 10 }
      ).toPromise();
    }
    if (!this.notificationHistoryType) {
      this.notificationHistory = await this.notificationsService.getNotificationHistorNormalByCustomerId(this.customer.id, this.constService.CONST.NOTIFICATION.EMBED_NOTIFICATION_HISTROY, this.selectedItems, { page: 1, limit: 10 }
      ).toPromise();
    }
    this.pageLimit = 10;
  }
  async loadMore() {
    if (this.notificationHistoryType) {
      this.additionalHistory = await this.notificationsService.getNotificationHistoryByCustomerId(
        this.customer.id,
        this.constService.CONST.NOTIFICATION.EMBED_NOTIFICATION_HISTROY,
        this.selectedItems,
        { page: 1, limit: 10 + this.pageLimit }
      ).toPromise();
    }
    if (!this.notificationHistoryType) {
      this.additionalHistory = await this.notificationsService.getNotificationHistorNormalByCustomerId(
        this.customer.id,
        this.constService.CONST.NOTIFICATION.EMBED_NOTIFICATION_HISTROY,
        this.selectedItems,
        { page: 1, limit: 10 + this.pageLimit }
      ).toPromise();
    }
    this.notificationHistory = this.additionalHistory;
    this.pageLimit += 10;
  }

  private async getNotificationSegmentByCustomerId() {
    this.segmentsList = await this.notificationsService.getNotificationSegmentByCustomerId(this.customer.id).toPromise();
  }



  onItemClicked(item: string) {
    this.notificationHistory = null
    const index = this.selectedItems.indexOf(item);
    if (index !== -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
    this.getNotificationHistory();
  }
  isSelected(item: string): boolean {
    return this.selectedItems.includes(item);
  }

  isContentOverTwoLines(content: string): boolean {
    const threshold = 130;
    return content.length > threshold;
  }

  toggleViewMore(content: string) {
    this.isModalOpen = true;
    this.notificationHistory.moreViewData = content;
  }
}

