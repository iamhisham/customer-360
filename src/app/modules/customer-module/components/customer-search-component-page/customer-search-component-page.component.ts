import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../service/common.service';

@Component({
  selector: 'app-customer-search-component-page',
  templateUrl: './customer-search-component-page.component.html',
  styleUrls: ['./customer-search-component-page.component.scss'],
})
export class CustomerSearchComponentPageComponent  implements OnInit {

  constructor(private commonService: CommonService) { }

  ngOnInit() {
    this.commonService.showCustomerSearchPopover = true;
  }

  ngOnDestroy() {
    this.commonService.showCustomerSearchPopover = false;
  }

}
