import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NotificationService } from 'src/app/modules/notification-module/services/notification.service';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import * as moment from 'moment';
import { AlertController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { RetryModalPopupComponentComponent } from '../retry-modal-popup-component/retry-modal-popup-component.component';
import { ConstantService } from 'src/app/service/constant.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {

  maxDate = new Date();

  @ViewChild('dateRange') dateRange: any;
  @ViewChild('error_display_grid') errorDisplayGrid: TableComponent | undefined;
  @ViewChild('error_count_display_grid') errorCountDisplayGrid: TableComponent | undefined;

  error: any = {};
  isErrorModalOpen: boolean = false;
  showErrorCount: boolean = false;
  errorCodeList = [
    { value: 'ERR-2001', text: 'ERR-2001' },
    { value: 'ERR-2002', text: 'ERR-2002' },
    { value: 'ERR-2003', text: 'ERR-2003' },
    { value: 'ERR-3001', text: 'ERR-3001' },
    { value: 'ERR-3002', text: 'ERR-3002' },
    { value: 'ERR-3003', text: 'ERR-3003' },
    { value: 'ERR-4001', text: 'ERR-4001' },
    { value: 'ERR-4002', text: 'ERR-4002' },
    { value: 'ERR-4003', text: 'ERR-4003' },
    { value: 'ERR-4101', text: 'ERR-4101' },
    { value: 'ERR-4102', text: 'ERR-4102' },
    { value: 'ERR-4201', text: 'ERR-4201' },
    { value: 'ERR-4301', text: 'ERR-4301' },
    { value: 'ERR-5001', text: 'ERR-5001' },
    { value: 'ERR-6001', text: 'ERR-6001' },
  ];
  errorcode_search = '';
  isSelectAll: boolean = false;
  totalErrorCount: number = 0;
  errorReason: any = {
    isModelOpen: false,
  }

  channelErrorList: any = {
    name: "channelErrorList",
    pk: "id",
    search: "",
    needServerSidePagination: true,
    skipDefaultApiTrigger: true,
    pageSize: 10,
    filterCriteria: { status: "ERROR" },
    customActionDropdown: true,
    isSelectableGrid: true,
    orderBy: "updatedAt desc",
    embed: this.constantService.ERROR_NOTIFICATION.GET_ALL.embed,
    isCheckboxVisible: (el: any) => { return (el.retry_status != 'IN_PROGRESS' && this.notifiService.excludeRetryErrorCodeList.indexOf(el.error_code) == -1) },
    fields: [
      { name: "ID", attr: "id", width: "75", filterType: 'ID' },
      { name: "Customer", attr: "customerId", width: "115", type: "LINK", filterType: 'ID' },
      { name: "Notification", attr: "notificationId", width: "115", type: "LINK", filterType: 'ID' },
      {
        name: "Channel", attr: "channel", width: "115", type: "IMAGE_LIST", filterType: 'ENUMS',
        filterEnums: [
          { value: "EMAIL", name: "Email" },
          { value: "WEB_PUSH", name: "Web Push" },
          { value: "MOBILE_PUSH", name: "Mobile Push" },
          { value: "SMS", name: "SMS" },
          { value: "IN_APP_MESSAGE", name: "In App Message" }
        ]
      },
      {
        name: "Priority", attr: "priority", width: "115", filterType: 'ENUMS',
        filterEnums: [
          { value: "LOW", name: "Low" },
          { value: "MEDIUM", name: "Medium" },
          { value: "MANDATORY", name: "Mandatory" },
        ]
      },
      {
        name: "Category", attr: "categoryName", width: "135", filterType: 'ENUMS',
        filterEnums: [], filterAttr: 'categoryId', sortAttr: 'category.name'
      },
      { name: "Error Code", attr: "errorCode", width: "160", filterType: 'NUMBER' },
      { name: "Retry Count", attr: "retryCount", width: "160", filterType: 'NUMBER' },
      {
        name: "Retry Status", attr: "retryStatus", width: "185", filterType: 'ENUMS',
        filterEnums: [
          { value: "N/A", name: "N/A" },
          { value: "IN_PROGRESS", name: "In-Progress" },
          { value: "SUCCESS", name: "Success" },
          { value: "FAILED", name: "Failed" },
        ]
      },
      { name: "Last Retry At ", attr: "lastRetryAt", width: "160", filterType: 'DATETIME' },
      { name: "Created Time", attr: "createdAt", width: "200", filterType: 'DATETIME' },
      { name: "Updated Time", attr: "updatedAt", width: "200", filterType: 'DATETIME' },
    ],
    actions: [
      { name: "View Notification Message", clickFunction: (el: any) => this.viewMessage(el.id, 'HISTORY') },
      { name: "View Error Message", clickFunction: (el: any) => this.viewMessage(el.id, 'HISTORY', true), isValid: (el: any) => el.status != 'CHANNEL_NOT_FOUND' },
      { name: "Retry", clickFunction: (el: any) => this.confirmationRetry(el.id), isValid: (el: any) => { return (el.retry_status != 'IN_PROGRESS' && this.notifiService.excludeRetryErrorCodeList.indexOf(el.errorCode) == -1) } }
    ],
    getRecord: (params: any) => this.notifiService.getAllHistoryError(params),
    buildData: (historyList: any) => {
      return historyList.map((history: any, index: any) => {
        let channel: any = [];
        if (history.channel.indexOf('EMAIL') !== -1) channel.push({ title: "Email", name: 'mail-outline' });
        if (history.channel.indexOf('WEB_PUSH') !== -1) channel.push({ title: "Web Push", name: 'desktop-outline' });
        if (history.channel.indexOf('MOBILE_PUSH') !== -1) channel.push({ title: "Mobile Push", name: 'phone-portrait-outline' });
        if (history.channel.indexOf('SMS') !== -1) channel.push({ title: "SMS", name: 'chatbox-ellipses-outline' });
        if (history.channel.indexOf('IN_APP_MESSAGE') !== -1) channel.push({ title: "In App", name: 'apps-outline' });
        return {
          id: history.id,
          customerId: history.customerId,
          notificationId: history.notificationId,
          channel: channel,
          isScheduled: history.isScheduled ? 'yes' : 'no',
          priority: history.priority,
          categoryName: history.categoryName,
          errorCode: history.errorCode,
          retryCount: history.retryCount,
          retryStatus: history.retryStatus,
          lastRetryAt: this.datePipe.transform(history.lastRetryAt, this.notifiService.date_time_format),
          createdAt: this.datePipe.transform(history.createdAt, this.notifiService.date_time_format),
          updatedAt: this.datePipe.transform(history.updatedAt, this.notifiService.date_time_format),
          link: {
            customerId: '/notification-center/user-profile/' + history.customerId + '/history',
            notificationId: history.isAbTesting ? '/notification-center/ab-testing/result/' + history.notificationId : '/notification-center/notification/' + history.notificationId + '/history'
          },
          action: {}
        };
      });
    }
  };

  filterFieldList: any = [
    { name: 'ID', attr: 'id', type: 'TEXT' },
    {
      name: 'Error Code', attr: 'errorCode', type: 'MULTI_SELECT', isSearchable: true,
      values: this.errorCodeList
    },
    {
      name: 'Retry Status', attr: 'retryStatus', type: 'MULTI_SELECT',
      values: [
        { value: 'N/A', text: 'N/A' },
        { value: 'IN PROGRESS', text: 'IN PROGRESS' },
        { value: 'FAILED', text: 'FAILED' }
      ]
    },
    {
      name: 'Select Channel', attr: 'channel', type: 'MULTI_SELECT',
      values: [
        { value: 'EMAIL', text: 'Email' },
        { value: 'WEB_PUSH', text: 'Web Push' },
        { value: 'MOBILE_PUSH', text: 'Mobile Push' },
        { value: 'SMS', text: 'SMS' }
      ]
    },
    {
      name: 'Start to End (Date & Time)', attr: 'startToEnddateTime', type: 'DATE_AND_TIME',
      values: []
    },
    { name: 'Customer ID', attr: 'customerId', type: 'TEXT' },
    { name: 'Notification ID', attr: 'notificationId', type: 'TEXT' }
  ];

  @ViewChild('channelError_grid') channelError_grid: TableComponent | undefined;
  // @ViewChild('error_page') errorPageSearch: DataTableSearchCriteriaComponent | undefined;

  errorViewList: any = {
    name: "errorViewList",
    pk: "id",
    search: "",
    pageSize: 10,
    fields: [
      { name: "Error Code", attr: "error_Code", width: "75" },
      { name: "Error Message", attr: "error_msg", width: "175" },
      { name: "Retry", attr: "error_retry", width: "175" }
    ],
    getRecord: (params: any) => this.notifiService.errorViewList(params),
    buildData: (errorList: any) => {
      return errorList.map((error: any) => {
        return {
          error_Code: error.error_code,
          error_msg: error.error_msg,
          error_retry: error.error_retry
        }
      });
    }
  }
  //Error Detail View List Table.
  errorDetailViewList: any = {
    name: "errorDetailViewList",
    pk: "id",
    search: "",
    pageSize: 10,
    fields: [
      { name: "Error Code", attr: "error_Code", width: "75" },
      { name: "Error Message", attr: "error_msg", width: "175" },
      { name: "Retry", attr: "error_retry", width: "175" },
      { name: "Count", attr: "count", width: "175" }
    ],
    getRecord: (params: any) => this.getErrorCountList(),
    buildData: (errorList: any) => {
      return errorList.map((error: any) => {
        return {
          error_Code: error.error_code,
          error_msg: error.error_msg,
          error_retry: error.error_retry,
          count: error.count
        }
      });
    }
  }

  isInitTriggered: boolean = false;
  filterCriteria: any = {};

  @ViewChild('filterPopover') filterPopover: any;

  constructor(public constantService: ConstantService, private notifiService: NotificationService, private datePipe: DatePipe, public modalController: ModalController,
    private alertController: AlertController) {

  }

  ngOnInit() {
    this.init();
    this.getErrorHistoryCount();
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
    this.renderTableData();
    await this.loadFilterData();
  }

  async loadFilterData() {
    const categoryList: any = await this.notifiService.getAllActiveCategoryNameList().toPromise();
    //category
    this.channelErrorList.fields[5].filterEnums = categoryList.data.map((obj: any) => {
      return { value: obj.id, name: obj.name };
    });
  }




  async getErrorHistoryCount() {
    this.error.isLoaded = false;
    this.notifiService.getErrorHistoryCount(this.channelErrorList.filterCriteria).subscribe({
      next: (history: any) => {
        this.error = history;
        this.error.isLoaded = true;
      },
      error: (err: any) => {
        err = err.error?.error || err.error || err;
      }
    });
  }

  async viewMessage(id: string, type: string, isErrormessage?: boolean) {
    this.notifiService.showLoader();
    try {
      if (type == "HISTORY") {
        var data: any = await this.notifiService.getNotificationHistoryById(id).toPromise();
        if (isErrormessage) {
          this.errorReason = data;
          this.errorReason.isModelOpen = true;
        } else {
          this.modalPresent(data);
        }
      }
    } catch (err: any) {
      this.notifiService.toster.error(err.message || err);
    }
    this.notifiService.hideLoader();
  }

  async modalPresent(data?: any, ErrorReason?: any) {
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
        cssClass: ErrorReason ? 'isViewReason' : 'viewMessage',
        componentProps: {
          preview_channel: ErrorReason ? null : data.channel,
          content: content,
          isEmailReadOnly: true,
          isViewReason: ErrorReason,
          isPreviewPopup: true
        },
        backdropDismiss: false
      });
      if (ErrorReason !== undefined && ErrorReason === null) throw { message: "No error message available" }
      await modal.present();
    } catch (err: any) {
      this.notifiService.toster.error(err.message || err);
    }
  }
  onClose() {
    this.modalController.dismiss();
  }

  clearValue() {
    this.filterCriteria.startToEnddateTime = [];
  }

  retryAll() {
    this.notifiService.showLoader();
    this.notifiService.retryAllHistory(this.channelErrorList.filterCriteria).subscribe({
      next: (e: any) => {
        // this.channelErrorList.reload();
        this.notifiService.hideLoader();
        // this.notifiService.toster.success('Retry initiated successfully');
        this.openErrorMsgPopup(e, true);
      },
      error: (err: any) => {
        this.notifiService.hideLoader();
        err = err.error?.error || err.error || err;
        this.openErrorMsgPopup(err, false);
        // err.CUSTOM_ERROR_CODE == 1001 ? this.notifiService.toster.error(`Retry is already initiated`) : this.notifiService.toster.error(err.message)
      }
    });
  }

  retrySelected() {
    this.notifiService.showLoader();
    this.notifiService.retryIndividualChannel({ 'idList': this.channelErrorList.selectedIdList }).subscribe({
      next: (e: any) => {
        // this.channelErrorList.reload();
        this.notifiService.hideLoader();
        // this.notifiService.toster.success('Retry initiated successfully');
        this.openErrorMsgPopup(e, true);
      },
      error: (err: any) => {
        this.notifiService.hideLoader();
        err = err.error?.error || err.error || err;
        this.openErrorMsgPopup(err, false);
        // err.CUSTOM_ERROR_CODE == 1001 ? this.notifiService.toster.error(`Retry is already initiated`) : this.notifiService.toster.error(err.message)
      }
    });
  }

  async confirmationRetry(id?: any) {
    var subHeaderContent = `Do you  want to retry${id ? ' Id: ' + id + '?' : ' all error Notifications?'}`;
    const alert = await this.alertController.create({
      header: 'Confirmation',
      subHeader: this.channelErrorList.selectedIdList.length > 0 && !id ? `Do you  want to retry selected notifications?` : subHeaderContent,
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
            else if (this.channelErrorList.selectedIdList.length > 0) this.retrySelected();
            else if (!id) { this.retryAll(); }
          }
        },
      ],
    });
    await alert.present();
  }

  individualRetry(id: any) {
    this.notifiService.showLoader();
    this.notifiService.retryIndividualChannel({ 'idList': id }).subscribe({
      next: (e: any) => {
        // this.channelErrorList.reload();
        this.notifiService.hideLoader();
        // this.notifiService.toster.success('Retry initiated successfully');
        this.openErrorMsgPopup(e, true);
      },
      error: (err: any) => {
        this.notifiService.hideLoader();
        err = err.error?.error || err.error || err;
        this.openErrorMsgPopup(err, false);
        // err.CUSTOM_ERROR_CODE == 1001 ? this.notifiService.toster.error(`Retry is already initiated`) : this.notifiService.toster.error(err.message);
      }
    });
  }


  closeErrorMessage() {
    this.errorReason.isModelOpen = false;
    // this.errorReason.data = '';
  }

  async openErrorMsgPopup(response: any, isSuccess: boolean = false) {
    const modal = await this.modalController.create({
      component: RetryModalPopupComponentComponent, //todo
      cssClass: 'retry-modal-popup',
      backdropDismiss: false,
      componentProps: { response, isSuccess }
    });
    modal.onDidDismiss().then(() => {
      if (isSuccess) {
        this.reloadAll();
      }
    })
    await modal.present();
  }

  async reloadAll() {
    await Promise.all([
      this.channelErrorList.reload(true),
      this.getErrorHistoryCount()
    ]);
  }
  getErrorCountList() {
    return new Observable((subscriber: any) => {
      var _this = this;
      async function fetchData() {
        var errorCountList: any = await _this.notifiService.getErrorCountDetail(_this.filterCriteria).toPromise();
        const errorCodeDetailList = _this.notifiService.errorCodeList.filter((mapObject: any) => {
          const matchingErrorCount = errorCountList.find((errorCount: any) => errorCount.errorCode === mapObject.error_code);
          if (matchingErrorCount) {
            mapObject.count = matchingErrorCount.count;
            return true;
          }
          return false;
        });
        _this.totalErrorCount = 0;
        errorCodeDetailList.forEach((obj: any) => { _this.totalErrorCount += obj.count });
        subscriber.next(errorCodeDetailList);
        subscriber.complete();
      }
      fetchData();
    });
  }

  openErrorView(showErrorCount: boolean) {
    this.showErrorCount = showErrorCount;
    this.isErrorModalOpen = true;
  }
  onInputChange(event: any) {
    if (this.filterCriteria.startToEnddateTime) this.filterCriteria.startToEnddateTime = this.notifiService.onInputChange(event);
    if (this.filterCriteria.startToEnddateTime.length == 0) {
      this.filterCriteria.start_date = '';
      this.filterCriteria.end_date = '';
    }
  }
  onSelectedValueChange(selectedValues: any[]) {
    this.filterCriteria.error_code = selectedValues;
  }

  applyFilter(filterCriteria: any) {
    this.channelErrorList.filterCriteria = filterCriteria;
    this.channelError_grid?.applyFilterCriteria();
  }

  renderTableData() {
    setTimeout(async () => {
      // this.errorPageSearch?.init(true);
      if (this.channelErrorList.isRendered) this.loadedTemplateData();
    }, 200);
  }

  loadedTemplateData() {
    this.channelError_grid?.applyFilterCriteria();
  }

  openFilterPopover(event: any) {
    this.filterPopover.event = event;
  }

}
