import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ConstantService } from 'src/app/service/constant.service';
import { CommonService } from 'src/app/service/common.service';
import { OrdersService } from 'src/app/modules/customer-module/services/orders.service';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { CurrencyPipe } from 'src/app/shared/pipe/currency.pipe';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, AfterViewInit {
  @Input() customerId: any;
  @Input() accountId: any;
  @Input() customer: any;

  @ViewChild('swiper') swiper?: any;

  purchasedDetails: any;
  ordersTable: any = {
    name: "orders",
    pk: "ac_no",
    needServerSidePagination: true,
    pageSize: 5,
    embed: this.constantService.CONST.ORDER.FIELD_OPEN_ORDERS,
    fields: [
      { name: "Order Number", attr: "orderNumber", type: "CLICK", clickFunction: (el: any) => { this.getOrderById(el.id); } },
      { name: "Order date", attr: "orderedDate" },
      { name: "Status", attr: "status", type: 'chip', className: "textCapitalize" },
      { name: "Amount", attr: "amount" },
    ],
    getRecord: (params: any) => { return this.getAllOrders(params) },
    buildData: (orderList: any) => {
      return orderList.map((order: any) => {
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          orderedDate: this.datePipe.transform(order.orderedDate, this.commonService.date_time_format),
          status: order.status,
          amount: this.currencyPipe.transform(order.currencyIsoCode) + ' ' + this.currencyPipe.transform(order.grandTotalAmount),
        };
      });
    }
  };

  @ViewChild('order_grid') orderGrid: TableComponent | undefined;

  orderDetails: any;
  paymentList: any;
  constructor(public commonService: CommonService, public datePipe: DatePipe, private currencyPipe: CurrencyPipe,
    private orderservice: OrdersService, private constantService: ConstantService) { }

  ngAfterViewInit(): void {
    this.swiper.nativeElement.swiper.allowTouchMove = false;
  }

  ngOnInit() {
    this.init();
  }

  async init(accountId: any = this.accountId) {
    this.accountId = accountId;
    if (this.customerId) {
      if (this.purchasedDetails?.id) {
        this.backToGrid()
      }
      this.orderGrid?.init();
      await Promise.all([
        this.getOrderDetails(),
      ]);
    }
  }

  async getOrderDetails() {
    this.orderDetails = null;
    if (this.accountId) {
      this.orderDetails = await this.orderservice.getPurchaseOverviewByAccountId(this.customerId, this.accountId).toPromise();
    } else {
      this.orderDetails = await this.orderservice.getPurchaseOverviewByCustomerId(this.customerId).toPromise();
    }
  }

  async getOrderById(orderId: any) {
    this.commonService.showLoader();
    this.purchasedDetails = null;
    if (orderId) {
      this.purchasedDetails = await this.orderservice.getOrderById(orderId, this.constantService.CONST.ORDER.FIELD_OPEN_ORDERS_BY_ID).toPromise();
      let invoiceIdList = this.purchasedDetails.invoices.map((data: any) => data.id);
      this.paymentList = await this.orderservice.getPaymentsByInvoiceID(this.customerId, this.accountId, invoiceIdList).toPromise();
      this.commonService.hideLoader();
      if (this.purchasedDetails) this.slideNext();
    }
  }

  async getAllOrders(params: any) {
    return await this.orderservice.getPurchaseHistory(this.customerId, this.accountId, params).toPromise();
  }

  slideNext() {
    this.swiper?.nativeElement.swiper.slideNext(500);
  }

  slidePrev() {
    this.swiper?.nativeElement.swiper.slidePrev(500);
  }

  backToGrid() {
    this.purchasedDetails = null;
    this.slidePrev();
    setTimeout(() => {
      this.commonService.scrollContent('tab-content');
    }, 700)
  }

}
