import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CustomersComponent } from 'src/app/modules/customer-module/components/customers/customers.component';
import { CommonService } from 'src/app/service/common.service';
import { ConstantService } from 'src/app/service/constant.service';
import { OrdersService } from 'src/app/modules/customer-module/services/orders.service';
import { OverviewService } from 'src/app/modules/customer-module/services/overview.service';
import { SubscriptionService } from 'src/app/modules/customer-module/services/subscription.service';
import Swiper from 'swiper';
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {

  @Input() customerId: any;
  @Input() accountId: any;

  @ViewChild('swiper') swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  subscriptionList: any = [];

  subscriptionDetails: any;
  orderDetails: any;
  lastPurchaseDetails: any = {};
  status = 'PENDING';
  chart: any;

  taskDetails: any = {
    name: "tasks",
    pk: "id",
    needServerSidePagination: true,
    isPageNationDisable: true,
    pageSize: 3,
    fields: [
      { name: "Task Id", attr: "id", width: "100", type: "CLICK", filterType: 'ID', clickFunction: (el: any) => { } },
      { name: "Name", width: "120", attr: "name", filterType: 'TEXT' },
      {
        name: "Priority", width: "120", attr: "priority", type: 'chip', className: "textCapitalize", filterType: 'ENUMS',
        filterEnums: [
          { value: "HIGH", name: "High" },
          { value: "LOW", name: "Low" },
          { value: "MEDIUM", name: "Medium" }

        ]
      },
      { name: "Due Date", width: "135", type: "DATE", format: this.commonService.date_format , attr: "dueDate", filterType: 'DATE' },
      {
        name: "Status", width: "120", attr: "status", type: 'chip', className: "textCapitalize", filterType: 'ENUMS',
        filterEnums: [
          { value: "OPEN", name: "open" },
          { value: "IN-PROGRESS", name: "in-progress" },
          { value: "CLOSED", name: "closed" },
        ]
      },
      { name: "Assignee", width: "135", attr: "assignee", }
    ],
    getRecord: (params: any) => this.getAllOpenTasks(params),
    buildData: (orderList: any) => {
      return orderList.map((order: any) => {
        return {
          id: order.taskNumber,
          name: order.name,
          priority: order.priority,
          dueDate: order.dueDate,
          status: order.status,
          assignee: order.assignee
        };
      });
    }
  };

  constructor(public datePipe: DatePipe, private overviewService: OverviewService,
    private orderService: OrdersService, private constantService: ConstantService, private subscriptionService: SubscriptionService,
    public customerComp: CustomersComponent, public commonService: CommonService) { }

  ngOnInit() {
    this.init();
  }

  async init(accountId: any = this.accountId) {
    this.accountId = accountId;
    if (this.customerId) {
      await Promise.all([
        this.getAllSubscriptionsByCustomerId(),
        this.getOpenOrdersStatus()
      ]);
    }
  }

  async getAllSubscriptionsByCustomerId() {
    try {
      this.subscriptionList = null;
      let list: any;
      if (this.accountId) {
        list = (await this.subscriptionService.getSubscriptionsByCustomerIdWithAccountId(this.customerId, this.accountId, this.constantService.CONST.SUBSCRIPTION.EMBED_SERVICE_DETAILS).toPromise() as any).data;
      } else {
        list = (await this.subscriptionService.getSubscriptionsByCustomerId(this.customerId, this.constantService.CONST.SUBSCRIPTION.EMBED_SERVICE_DETAILS).toPromise() as any).data;
      }
      this.subscriptionList = list.sort((a: any, b: any) => a.status.localeCompare(b.status));

      await Promise.all(this.subscriptionList.map(async (subscription: any) => {
        this.getSubscriptionSummary(subscription);
      }));
    } catch (e: any) {
      console.log((e.error?.error?.message || e.message || e), 'ERROR');
    }
  }

  async getAllOpenTasks(params: any) {
    if (this.accountId) {
      return await this.overviewService.getAllTaskByAccountId(this.customerId, this.accountId, this.constantService.CONST.CUSTOMER.FIELD_TASK_DETAILS, params).toPromise();
    } else {
      return await this.overviewService.getAllTaskByCustomerId(this.customerId, this.constantService.CONST.CUSTOMER.FIELD_TASK_DETAILS, params).toPromise();
    }
  }

  async getOpenOrdersStatus() {
    this.orderDetails = null;
    if (this.accountId) {
      this.orderDetails = (await this.orderService.getOpenOrdersByCustomerIdAndAccountID(this.customerId, this.accountId, this.constantService.CONST.ORDER.FIELD_OVERVIEW_OPEN_ORDERS).toPromise() as any).data;
    } else {
      this.orderDetails = (await this.orderService.getOpenOrdersByCustomerId(this.customerId, this.constantService.CONST.ORDER.FIELD_OVERVIEW_OPEN_ORDERS).toPromise() as any).data;
    }
  }
  async getSubscriptionSummary(subscription: any) {
    subscription.usageDetails = null;
    subscription.billingDetails = null;
    await Promise.all(['usageDetails', 'billingDetails'].map(async (key: string) => {
      if (key == 'usageDetails' && subscription.status === 'ACTIVE') {
        subscription.usageDetails = await this.subscriptionService.getSubscriptionSummaryByCustomerIdAndAccountIdAndSubscriptionId(this.customerId, this.accountId, subscription.id).toPromise();
        const dataUsedPercent = subscription.usageDetails.dataUsedPercentage;
        subscription.chart = await this.getChartData(dataUsedPercent);
      } else if (key == 'billingDetails') {
        const result: any = await this.orderService.getInvoiceStatusByCustomerIdWithAccountIdAndSubscriptionId(this.customerId, this.accountId, subscription.id, this.status, this.constantService.CONST.SUBSCRIPTION.FIELD_SUBSCRIPTION_DETAILS).toPromise();
        subscription.billingDetails = result.data[0] || {};
      }
    }));
  }

  swiperSlideChanged(e: any) {
    console.log('changed', e)
  }
  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }
  goNext() {
    this.swiper?.slideNext();
  }
  goPrev() {
    this.swiper?.slidePrev();
  }

  async getChartData(seriesValue: any) {
    return {
      colors: ['#5164B8'],
      series: [seriesValue],
      chart: {
        height: 115,
        type: 'radialBar'
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '45%'
          },
          dataLabels: {
            name: {
              show: true,
              color: "#000",
              offsetY: 4
            },
            value: {
              show: false,
            }
          },
          track: {
            background: '#D0E5FC'
          }
        }
      },
      labels: [seriesValue + '%']
    }
  }

}
