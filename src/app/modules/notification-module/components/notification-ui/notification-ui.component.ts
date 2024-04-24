import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { NotificationService } from 'src/app/modules/notification-module/services/notification.service';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notification-ui',
  templateUrl: './notification-ui.component.html',
  styleUrls: ['./notification-ui.component.scss'],
})
export class NotificationUiComponent implements OnInit {

  category_search = "";
  isAbTesting: boolean = false;

  notificationTableDetails: any = {
    name: "notification",
    pk: "id",
    search: "",
    filterCriteria: { is_ab_testing: false },
    needServerSidePagination: true,
    pageSize: 10,
    orderBy: "updatedAt desc",
    skipDefaultApiTrigger: true,
    fields: [
      { name: "ID", attr: "id", width: "75", type: "LINK", filterType: 'ID' },
      {
        name: "Single/Multi ", attr: "userType", width: "100", type: "IMAGE", filterAttr: "isBulkNotification", filterType: 'ENUMS',
        filterEnums: [
          { value: "false", name: "Single User", imageSrc: "../../../assets/icons/" + this.notifiService.themeName + "/singleuser.png" },
          { value: "true", name: "Multiple Users", imageSrc: "../../../assets/icons/" + this.notifiService.themeName + "/multiuser.png" }
        ]
      },
      { name: "Category ", attr: "categoryName", width: "175", disableSort: true, filterType: 'ENUMS', filterEnums: [], filterAttr: 'categoryId' },
      { name: "Channel", attr: "channels", width: "135", type: "IMAGE_LIST" },
      {
        name: "Scheduled? ", attr: "isScheduled", width: "115", className: "textCapitalize", filterType: 'ENUMS',
        filterEnums: [
          { value: "true", name: "Yes" },
          { value: "false", name: "No" }
        ]
      },
      { name: "Sent/Scheduled", attr: "sendOrScheduled", width: "175", disableSort: true },
      {
        name: "Status", attr: "status", width: "120", filterType: 'ENUMS',
        filterEnums: [
          { value: 'CREATED', name: 'Created' },
          { value: 'TRIGGERED', name: 'Triggered' },
          { value: 'SCHEDULED', name: 'Scheduled' },
          { value: 'FAILED', name: 'Failed' },
        ]
      },
      { name: "Created Time", attr: "createdAt", type: "DATE", format: this.notifiService.date_time_format, width: "175", filterType: 'DATETIME', },
      { name: "Updated Time", attr: "updatedAt",  type: "DATE", format: this.notifiService.date_time_format, width: "175", filterType: 'DATETIME', },
    ],
    actions: [
      { name: "View", attr: 'view', isValid: (el: any) => el.isProcessed },
      { name: "Edit", attr: 'edit', isValid: (el: any) => !el.isProcessed },
      { name: "Clone", attr: 'clone' },
      { name: "Delete", clickFunction: (el: any) => this.confirmDelete(el.id) },
      { name: "Retry", clickFunction: (el: any) => this.confirmationRetry(el.id), isValid: (el: any) => { return (el.status == "FAILED" && this.notifiService.excludeRetryErrorCodeList.indexOf(el.errorCode) == -1) } }
    ],
    getRecord: (params: any) => this.notifiService.getAllNotification(params, this.isAbTesting),
    buildData: (notification: any) => {
      return notification.map((notification: any) => {
        var channels: any = [];
        if (notification.channels.indexOf('EMAIL') !== -1) channels.push({ title: "Email", name: 'mail-outline' });
        if (notification.channels.indexOf('WEB_PUSH') !== -1) channels.push({ title: "Web Push", name: 'desktop-outline' });
        if (notification.channels.indexOf('MOBILE_PUSH') !== -1) channels.push({ title: "Mobile Push", name: 'phone-portrait-outline' });
        if (notification.channels.indexOf('SMS') !== -1) channels.push({ title: "SMS", name: 'chatbox-ellipses-outline' });
        if (notification.channels.indexOf('IN_APP_MESSAGE') !== -1) channels.push({ title: "In App", name: 'apps-outline' });
        return {
          id: notification.id,
          userType: notification.isBulkNotification ? { src: "../../../assets/icons/" + this.notifiService.themeName + "/multiuser.png", title: 'Multiple Users' } : { src: "../../../assets/icons/" + this.notifiService.themeName + "/singleuser.png", title: 'Single User' },
          UserType: notification.isBulkNotification ? 'Multiple Users' : 'Single User',
          categoryName: notification.category?.name,
          channels: channels,
          errorCode: notification.errorCode,
          isScheduled: notification.isScheduled ? 'yes' : 'no',
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
          sendOrScheduled: this.datePipe.transform(notification.status === 'TRIGGERED' ? notification.processedAt : (notification.isScheduled ? notification.scheduledAt : null), this.notifiService.date_time_format),
          status: notification.status,
          isProcessed: notification.isProcessed,
          link: {
            id: notification.isProcessed ? '/notification/' + notification.id + '/history' : notification.status == 'FAILED' ? '/notification/' + notification.id + '/history' : '/notification/' + notification.id
          },
          action: {
            view: '/notification-center/notification/' + notification.id + '/history',
            edit: '/notification-center/notification/' + notification.id,
            clone: '/notification-center/notification/clone/' + notification.id,
          }
        };
      });
    }
  };
  filterFieldList: any = [
    {
      name: 'User Type', attr: 'userType', type: 'MULTI_SELECT',
      values: [
        { value: 'SINGLE', text: 'SINGLE' },
        { value: 'MULTIPLE', text: 'MULTIPLE' }
      ]
    },
    {
      name: 'Status', attr: 'status', type: 'MULTI_SELECT',
      values: [
        { value: 'CREATED', text: 'CREATED' },
        { value: 'TRIGGERED', text: 'TRIGGERED' },
        { value: 'SCHEDULED', text: 'SCHEDULED' },
        { value: 'FAILED', text: 'FAILED' },

      ]
    },
    {
      name: 'Category', attr: 'categoryId', type: 'MULTI_SELECT', isSearchable: true,
      values: []
    },
    { name: 'ID', attr: 'id', type: 'TEXT' },

  ];
  notificationList: any = [];
  categoryList: any = [];

  date = 12 / 2 / 2021;

  @ViewChild('notification_grid') notification_grid: TableComponent | undefined;
  // @ViewChild('notification_search') notificationSearch: DataTableSearchCriteriaComponent | undefined;

  isInitTriggered: boolean = false;

  constructor(private datePipe: DatePipe, public notifiService: NotificationService,
    private alertController: AlertController, public loadingCtrl: LoadingController, public modalctrl: ModalController, private router: Router) {

  }

  ngOnInit() {
    this.init();
  }

  ionViewWillEnter() {
    this.init();
  }

  ionViewWillLeave() {
    this.isInitTriggered = false;
    this.notifiService.closeAllAlertCtrl();
  }

  async init() {
    if (this.isInitTriggered) return;
    this.isInitTriggered = true;
    this.getAllCategory();
    await this.loadFilterData();
  }

  async loadFilterData() {
    const categoryList: any = await this.notifiService.getAllActiveCategoryNameList().toPromise();
    //category
    this.notificationTableDetails.fields[2].filterEnums = categoryList.data.map((obj: any) => {
      return { value: obj.id, name: obj.name };
    });
  }

  getAllCategory() {
    this.notifiService.getAllActiveCategoryNameList().subscribe({
      next: (categoryList: any) => {
        this.categoryList = categoryList.data;
        this.filterFieldList.find((fields: any, index: any) => {
          if (fields.attr === 'categoryId') {
            this.filterFieldList[index].values = this.categoryList.map((data: any) => {
              return { value: data.id, text: data.name };
            });
          }
        });
        // this.notificationSearch?.init(true);
      },
      error: (err: any) => {
        err = err.error?.error || err.error || err;
        this.notifiService.toster.error(err.message || 'Failed');
      }
    });
  }

  deleteNotification(id: any) {
    this.notifiService.showLoader();
    this.notifiService.deleteNotificationById(id, false).subscribe({
      next: async (data: any) => {
        this.notifiService.toster.success('Notification Deleted successfully!');
        await this.notification_grid?.init();
        this.notifiService.hideLoader();
      },
      error: (err: any) => {
        this.notifiService.hideLoader();
        err = err.error?.error || err.error || err;
        this.notifiService.toster.error(err.message || 'Notification Delete Failed');
      }
    });
  }


  goCreatePage() {
    this.router.navigateByUrl('/notification-center/notification/create');
  }


  // async confirmDelete(id: any) {
  //   const alert = await this.alertController.create({
  //     header: 'Are you sure?',
  //     subHeader: 'Changes you made will be deleted.',
  //     message: "<div class='warning-wraper ion-margin'>" +
  //       "<div class='warning-title-wrapper'>" +
  //       "<ion-icon name='warning' class='icon-color'></ion-icon>" +
  //       "<ion-label class='warning-title'>Warning</ion-label>" +
  //       "</div>" +
  //       "<p class='warning-content'>By deleting the notification associated <span class='bold-text'>History</span> details will also removed. </p>" +
  //       "</div>",
  //     cssClass: 'custom-alert-style',
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         cssClass: 'alert-button-cancel',
  //       },
  //       {
  //         text: 'Delete',
  //         cssClass: 'alert-button-confirm',
  //         handler: () => {
  //           this.deleteNotification(id);
  //         }
  //       },
  //     ],
  //   });
  //   alert.setAttribute('style', '--min-width:30vw;');
  //   await alert.present();
  // }
  async confirmDelete(id: any) {
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
        text: 'Changes you made will be deleted.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        this.deleteNotification(id);
      }
    } catch (e: any) {
      console.error(e);
    }
  }
  onClose() {
    this.modalctrl.dismiss();
  }

  async confirmationRetry(id?: any) {
    var subHeaderContent = `Do you  want to retry Id: + ${id}`;
    const alert = await this.alertController.create({
      header: 'Confirmation',
      subHeader: subHeaderContent,
      cssClass: 'custom-alert-style',
      buttons: [
        {
          text: 'No',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Yes',
          cssClass: 'alert-button-confirm',
          handler: () => {
            if (id) this.individualRetry(id);
          }
        },
      ],
    });
    await alert.present();
  }

  individualRetry(id: any) {
    this.notifiService.showLoader();
    this.notifiService.retryIndividualNotifcation({ 'idList': id }).subscribe({
      next: (e: any) => {
        this.notificationTableDetails.reload();
        this.notifiService.hideLoader();
        this.notifiService.toster.success('Retry initiated successfully');
      },
      error: (err: any) => {
        this.notifiService.hideLoader();
        err = err.error?.error || err.error || err;
        err.CUSTOM_ERROR_CODE == 1001 ? this.notifiService.toster.error(`Retry is already initiated`) : this.notifiService.toster.error(err.message)
      }
    });
  }


}
