import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { DataTableSearchCriteriaComponent } from 'src/app/modules/notification-module/components/data-table-search-criteria/data-table-search-criteria.component';
import { NotificationService } from 'src/app/modules/notification-module/services/notification.service';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { ConstantService } from 'src/app/service/constant.service';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss'],
})
export class QueueComponent implements OnInit {
  @ViewChild('dateRange') dateRange: any;

  queue: any = {};
  errorQueueList: any = {
    name: "errorQueueList",
    pk: "id",
    search: "",
    needServerSidePagination: true,
    pageSize: 10,
    filterCriteria: { status: "ERROR" },
    customActionDropdown: true,
    orderBy: "createdAt desc",
    embed: this.constantService.QUEUE_NOTIFICATION.GET_ALL.embed,
    fields: [
      { name: "ID", attr: "id", width: "35", filterType: 'ID' },
      { name: "User", attr: "customerId", width: "75", type: "LINK", filterType: 'ID' },
      { name: "Notification", attr: "notificationId", width: "115", type: "LINK", filterType: 'ID' },
      { name: "Category", attr: "categoryName", width: "160" },
      {
        name: "Channel", attr: "channel", width: "100", type: "IMAGE_LIST", filterType: 'ENUMS',
        filterEnums: [
          { value: "EMAIL", name: "Email" },
          { value: "WEB_PUSH", name: "Web Push" },
          { value: "MOBILE_PUSH", name: "Mobile Push" },
          { value: "SMS", name: "SMS" },
          { value: "IN_APP_MESSAGE", name: "In App Message" }
        ]
      },
      { name: "Identifier", attr: "identifier", width: "160" },
      {
        name: "Priority", attr: "priority", width: "100", className: "textCapitalize", filterType: 'ENUMS',
        filterEnums: [
          { value: "LOW", name: "Low" },
          { value: "MEDIUM", name: "Medium" },
          { value: "MANDATORY", name: "Mandatory" },
        ]
      },
      {
        name: "Status", attr: "status", width: "100", filterType: 'ENUMS',
        filterEnums: [
          { value: "QUEUED", name: "Queued" },
          { value: "DEFERRED", name: "Deferred" },
          { value: "ERROR", name: "error" },
        ]
      },
      { name: "Created Time", attr: "createdAt", width: "200", filterType: 'DATETIME' },
    ],
    actions: [
      { name: "View Message", clickFunction: (el: any) => this.viewMessage(el.id) }
    ],
    getRecord: (params: any) => this.notifiService.getAllQueue(params),
    buildData: (notificationList: any) => {
      return notificationList.map((notification: any) => {
        var channel: any = [];
        if (notification.channel) {
          if (notification.channel.indexOf('EMAIL') !== -1) channel.push({ title: "Email", name: 'mail-outline' });
          if (notification.channel.indexOf('WEB_PUSH') !== -1) channel.push({ title: "Web Push", name: 'desktop-outline' });
          if (notification.channel.indexOf('MOBILE_PUSH') !== -1) channel.push({ title: "Mobile Push", name: 'phone-portrait-outline' });
          if (notification.channel.indexOf('SMS') !== -1) channel.push({ title: "SMS", name: 'chatbox-ellipses-outline' });
          if (notification.channel.indexOf('IN_APP_MESSAGE') !== -1) channel.push({ title: "In App", name: 'apps-outline' });
        }
        return {
          id: notification.id,
          customerId: notification.customerId,
          notificationId: notification.notificationId,
          categoryName: notification.categoryName,
          channel: channel,
          identifier: notification.identifier,
          priority: notification.priority,
          status: notification.status,
          createdAt: this.datePipe.transform(notification.createdAt, this.notifiService.date_time_format),
          link: {
            customerId: '/notification-center/user-profile/' + notification.customerId + '/history',
            notificationId: notification.isAbTesting ? '/notification-center/ab-testing/result/' + notification.notificationId : '/notification-center/notification/' + notification.notificationId + '/history'
          },
          action: {}
        };
      });
    }
  };

  filterFieldList: any = [
    {
      name: 'Select Chennal', attr: 'channel', type: 'MULTI_SELECT',
      values: [
        { value: 'EMAIL', text: 'WEB_PUSH' },
        { value: 'MOBILE PUSH', text: 'WEB_PUSH' },
        { value: 'WEB PUSH', text: 'WEB_PUSH' },
        { value: 'SMS', text: 'WEB_PUSH' }
      ]
    },
    {
      name: 'Start to End (Date & Time)', attr: 'startToEnddateTime', type: 'DATE_AND_TIME',
      values: []
    },
    { name: 'User Id', attr: 'user_id', type: 'TEXT' },
    { name: 'Notification Id', attr: 'notification_id', type: 'TEXT' },
    { name: 'Id', attr: 'id', type: 'TEXT' },
  ];
  @ViewChild('queue_search') notificationSearch: DataTableSearchCriteriaComponent | undefined;
  @ViewChild('queue_grid') queue_grid: TableComponent | undefined;

  @ViewChild('filterPopover') filterPopover: any;

  isInitTriggered: boolean = false;


  constructor(public constantService: ConstantService, public notifiService: NotificationService, private alertController: AlertController, private datePipe: DatePipe,
    public modalController: ModalController) {
  }

  ngOnInit() {
    this.init();
    this.getQueueCount();
  }

  ionViewWillEnter() {
    this.init();
  }

  ionViewWillLeave() {
    this.isInitTriggered = false;
    this.notifiService.closeAllAlertCtrl();
  }

  init() {
    if (this.isInitTriggered) return;
    this.isInitTriggered = true;
  }

  async getQueueCount() {
    this.queue.isLoaded = false;
    this.notifiService.getQueueCount(this.errorQueueList.filterCriteria).subscribe({
      next: (history: any) => {
        this.queue = history;
        this.queue.isLoaded = true;
      },
      error: (err: any) => {
        err = err.error?.error || err.error || err;
      }
    });
  }

  async modalPresent(data?: any) {
    try {
      var content = data.content;
      if (data.channel == 'MOBILE_PUSH') {
        if (content.image) content.image = { source_type: 'URL', url: content.image };
      } else if (data.channel == 'WEB_PUSH') {
        if (content.icon) content.icon = { source_type: 'URL', url: content.icon };
        if (content.image) content.image = { source_type: 'URL', url: content.image };
      }
      this.notifiService.hideLoader();
      var modal = await this.modalController.create({
        component: 'TemplatePageComponent', //todo
        cssClass: 'viewMessage',
        componentProps: {
          preview_channel: data.channel,
          content: content,
          isEmailReadOnly: true,
          isPreviewPopup: true
        },
        backdropDismiss: false
      });
      await modal.present();
    } catch (err: any) {
      this.notifiService.toster.error(err.message || err);
    }
  }
  onClose() {
    this.modalController.dismiss();
  }


  async viewMessage(id: string) {
    this.notifiService.showLoader();
    try {
      var data: any = await this.notifiService.getNotificationQueueById(id).toPromise();
      this.modalPresent(data);
    } catch (err: any) {
      this.notifiService.toster.error(err.message || err);
    }
    this.notifiService.hideLoader();
  }

  async reloadAll() {
    await Promise.all([
      this.getQueueCount(),
      this.errorQueueList.reload(true)
    ]);
  }



  openFilterPopover(event: any) {
    this.filterPopover.event = event;
  }
}
