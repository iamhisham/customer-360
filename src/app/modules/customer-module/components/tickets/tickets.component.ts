import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { CaseService } from 'src/app/modules/customer-module/services/case.service';
import { ConstantService } from 'src/app/service/constant.service';
import { CommonService } from 'src/app/service/common.service';
import { TableComponent } from 'src/app/shared/components/table/table.component';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
})
export class TicketsComponent implements OnInit, AfterViewInit {
  @Input() customer: any;
  @Input() accountId: any;
  selectedTicket: any;
  ticketTableDetails: any = {
    name: "tickets",
    pk: "tkt_number",
    needServerSidePagination: true,
    embed: this.constantService.CONST.CASE.FIELD_TICKET_HISTORY,
    fields: [
      { name: "Ticket Number", attr: "caseNumber", width: "150", type: "CLICK", clickFunction: (el: any) => this.getTicketById(el) },
      { name: "Type", attr: "type", width: "175", type: 'chip', className: "textCapitalize" },
      { name: "Category", attr: "subject" },
      { name: "Assignee", attr: "assignee" },
      { name: "Status", attr: "status", type: 'chip', className: "textCapitalize" },
      { name: "Created Date", attr: "createdAt", type: "DATE", format: this.commonService.date_time_format },
      { name: "Updated Date", attr: "updatedAt", type: "DATE", format: this.commonService.date_time_format  }
    ],
    getRecord: (params: any) => this.getAllTickets(params),
    buildData: (ticketList: any) => {
      return ticketList.map((ticket: any) => {
        return {
          caseNumber: ticket.caseNumber,
          id: ticket.id,
          type: ticket.type,
          subject: ticket.subject,
          reason: ticket.reason,
          assignee: ticket.assignee,
          status: ticket.status,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt
        };
      });
    }
  };
  breadcrumbs: any[] = [];
  problemChart: any;
  serviceRequestChart: any;
  incidentChart: any;
  ticketByOriginChart: any;
  ticketDetails: any;
  ticketSummary: any;

  @ViewChild('swiper') swiper?: any;
  @ViewChild('ticket_grid') ticket_grid: TableComponent | undefined;

  constructor(public commonService: CommonService, private constantService: ConstantService,
    public datePipe: DatePipe, private caseService: CaseService) { }

  ngAfterViewInit(): void {
    this.swiper.nativeElement.swiper.allowTouchMove = false;
  }

  ngOnInit() {
    this.init();
  }

  async init(accountId: any = this.accountId) {
    this.accountId = accountId;
    if (this.customer?.id) {
      this.ticket_grid?.init();
      if (this.selectedTicket?.id) this.backToTicketListView();
      await Promise.all([
        this.getTicketSummary(),
        this.getOrginTicketSummary(),
      ]);
    }
  }

  async getTicketSummary() {
    this.ticketSummary = null;
    this.problemChart = null;
    this.serviceRequestChart = null;
    this.incidentChart = null;
    this.ticketSummary = await this.caseService.getTicketSummary(this.customer.id, this.accountId).toPromise();
    this.problemChart = this.getRadialBarChartData({ total: this.ticketSummary.total, data: this.ticketSummary.problem });
    this.serviceRequestChart = this.getRadialBarChartData({ total: this.ticketSummary.total, data: this.ticketSummary.serviceRequest });
    this.incidentChart = this.getRadialBarChartData({ total: this.ticketSummary.total, data: this.ticketSummary.incident });
  }

  async getOrginTicketSummary() {
    var tickets = await this.caseService.getOrginTicketSummary(this.customer.id, this.accountId).toPromise();
    this.ticketByOriginChart = this.getDonutChartData(tickets);
  }

  async getAllTickets(params: any) {
    return await this.caseService.getAllTickets(this.customer.id, this.accountId, params).toPromise();
  }

  getRadialBarChartData(obj: any) {
    const { total, data } = obj;
    return {
      value: data,
      colors: ['#5164B8'],
      series: [Number(((data / total) * 100).toFixed(2))],
      chart: { height: 150, type: 'radialBar', offsetY: -20, },
      plotOptions: {
        radialBar: {
          hollow: { size: '30%' },
          dataLabels: {
            name: { show: true, offsetY: 8, color: "#000" },
            value: { show: true, offsetY: 8, formatter: () => { return total; } },
          },
          track: {
            background: '#D0E5FC', // strokeWidth: '80%'
          }
        }
      },
      labels: ['Total'],
      legend: { show: false }
    };
  }

  getDonutChartData(seriesvalue: any) {
    return {
      series: [seriesvalue.email, seriesvalue.phone, seriesvalue.sms, seriesvalue.web],
      labels: ['Email', 'Call', 'Sms', 'Web'],
      colors: ['#5164B8', '#ffdd30', '#D0E5FC', '#41C0BF'],
      chart: { type: 'donut', height: 200 },
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                color: 'var(--common-text)',
                fontSize: 14,
                fontWeight: 400,
                fontFamily: 'Roboto',
                formatter: () => { return seriesvalue.total; }
              }
            }
          }
        }
      },
      legend: {
        show: true,
        showAlways: false,
        position: 'right',
        fontSize: '14px',
        // offsetY: 6,
        labels: { colors: 'var(--common-text)' },
        itemMargin: { vertical: 8 },
        formatter: function (seriesName: string, opts: any) {
          return [seriesName, " - ", opts.w.globals.series[opts.seriesIndex]]
        }
      }
    }
  }

  async getTicketById(data: any) {
    this.ticketDetails = null;
    this.commonService.showLoader();
    this.selectedTicket = data;
    this.ticketDetails = await this.caseService.getAllTicketsById(this.customer.id, this.accountId, data.id).toPromise();
    this.ticketDetails.incident = (await this.caseService.getIncidentTicket(data.id).toPromise() as any).data;
    this.ticketDetails.logs = (await this.caseService.getlogByCustomerIdAccountId(this.customer.id, this.accountId, data.id).toPromise() as any).caseActivityLogs;
    this.ticketDetails.task = await this.caseService.getTaskByTicket(this.customer.id, this.accountId, data.id).toPromise();
    const isBreadcrumbExists = this.breadcrumbs.some(crumb => crumb.id === data.id);
    if (!isBreadcrumbExists) this.breadcrumbs.push(data);
    this.commonService.hideLoader();
    if (this.ticketDetails) this.slideNext();
  }
  backToTicketListView() {
    this.slidePrev();
    this.breadcrumbs = [];
    setTimeout(() => {
      this.commonService.scrollContent('tab-content');
    }, 700)
  }

  slideNext() {
    this.swiper?.nativeElement.swiper.slideNext(500);
  }

  slidePrev() {
    this.swiper?.nativeElement.swiper.slidePrev(500);
  }
  onRelatedIncidentClick(data: any): void {
    // this.breadcrumbs.push(data);
    this.getTicketById(data);
  }
  onBreadcrumbClick(index: number, data: any): void {

    this.breadcrumbs.splice(index + 1);
    this.getTicketById(data);
  }
}
