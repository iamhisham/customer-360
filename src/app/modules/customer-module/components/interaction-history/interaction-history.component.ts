import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../../../service/common.service';
import { InteractionHistoryService } from '../../services/interaction-history.service';

@Component({
  selector: 'app-interaction-history',
  templateUrl: './interaction-history.component.html',
  styleUrls: ['./interaction-history.component.scss'],
})
export class InteractionHistoryComponent implements OnInit {
  @Input() customer: any;
  @Input() accountId: any;
  interactionHistoryTabs: any = ['Insights', 'Recommendation', 'Timeline'];
  selectedList: any;
  opportunities: any;

  constructor(public commonService: CommonService, public interactionHistoryService: InteractionHistoryService,
    public datePipe: DatePipe) {
    this.selectedList = 'Insights';
  }

  ngOnInit() {
    this.init();
  }

  async init(accountId: any = this.accountId) {
    this.accountId = accountId;
    if (this.customer?.id) {
      await Promise.all([
        this.getOpportunitiesByCustomerId(),
      ]);

    }
  }
  private async getOpportunitiesByCustomerId() {
    this.opportunities = (await this.interactionHistoryService.getOpportunitiesByCustomerId(this.customer.id).toPromise() as any).data;
  }
  showComponent(value: any) {
    this.selectedList = value;
  }
}
