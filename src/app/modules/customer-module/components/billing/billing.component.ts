import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CurrencyPipe } from 'src/app/shared/pipe/currency.pipe';
import { CommonService } from 'src/app/service/common.service';
import { ConstantService } from 'src/app/service/constant.service';
import { OrdersService } from 'src/app/modules/customer-module/services/orders.service';
import { TableComponent } from 'src/app/shared/components/table/table.component';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
})
export class BillingComponent implements OnInit {
  @Input() customer: any;
  @Input() accountId: any;
  payment: any;
  billDetails: any;
  billHistory: any;

  billingDetails: any = {
    name: "Payment",
    pk: "id",
    needServerSidePagination: true,
    fields: [
      { name: "Invoice Number", attr: "invoiceNumber", width: 150, className: "textCapitalize" },
      { name: "Invoice Date", attr: "invoiceDate", width: 150, className: "textCapitalize" },
      { name: "Amount", attr: "grandTotalAmount", width: 150 },
      { name: "Status", attr: "status", className: "textCapitalize", type: 'chip' },
      { name: "Due date", attr: "dueDate", className: "textCapitalize", width: 150 },
      { name: "Paid date", attr: "fullSettlementDate", className: "textCapitalize", width: 150 },
      { name: "", attr: "download_action", type: 'DOWNLOAD_ACTION', className: "textCapitalize" }
    ],
    getRecord: (params: any) => this.getAllTableData(params),
    buildData: (orderList: any) => {
      return orderList.map((order: any) => {
        return {
          invoiceNumber: order.invoiceNumber,
          invoiceDate: this.datePipe.transform(order.invoiceDate, this.commonService.date_format),
          grandTotalAmount: this.currencyPipe.transform(order.currencyIsoCode) + ' ' + this.currencyPipe.transform(order.grandTotalAmount),
          status: order.status,
          dueDate: this.datePipe.transform(order.dueDate, this.commonService.date_format),
          fullSettlementDate: this.datePipe.transform(order.fullSettlementDate, this.commonService.date_format),
          dwnload: order.download_action
        };
      });
    }
  };
  @ViewChild('bill_grid') billGrid: TableComponent | undefined;

  constructor(private orderService: OrdersService, private constantService: ConstantService,
    private datePipe: DatePipe, private commonService: CommonService, private currencyPipe: CurrencyPipe) { }

  ngOnInit() {
    this.init();
  }
  async init(accountId: any = this.accountId) {
    this.accountId = accountId;
    this.billGrid?.init();
    if (this.customer.id) {
      await Promise.all([
        await this.getBillDetails(),
      ]);
    }
  }

  getAllTableData(params: any) {
    if (this.accountId) {
      return this.orderService.getBillHistoryByCustomerIdAndAccountIdWithStatus(this.customer.id, this.accountId, this.constantService.CONST.ORDER.FIELD_BILL_HISTORY, params).toPromise();
    } else {
      return this.orderService.getBillHistoryByCustomerId(this.customer.id, this.constantService.CONST.ORDER.FIELD_BILL_HISTORY, params).toPromise();
    }
  }
  async getBillDetails() {
    this.billDetails = null;
    if (this.accountId) {
      this.billDetails = (await this.orderService.getPaymentHistoryByCustomerIdAndAccountIdWithStatus(this.customer.id, this.accountId, this.constantService.CONST.ORDER.FIELD_PAYMENT_HISTORY).toPromise() as any).data;
    } else {
      this.billDetails = (await this.orderService.getPaymentHistoryByCustomerIdWithStatus(this.customer.id, this.constantService.CONST.ORDER.FIELD_PAYMENT_HISTORY).toPromise() as any).data;
    }
  };

}
