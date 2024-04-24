import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-search-customer',
  templateUrl: './search-customer.component.html',
  styleUrls: ['./search-customer.component.scss'],
})
export class SearchCustomerComponent implements OnInit {
  searchParams: any = {};

  accountDetails: any = {
    name: "account",
    pk: "id",
    needServerSidePagination: true,
    pageSize: 10,
    fields: [
      { name: "ID", attr: "id", width: "50", type: "LINK" },
      { name: "Account number", attr: "accountNumber" },
      { name: "Customer type", width: "120", attr: "customerId", className:"textCapitalize typeColor" },
      { name: "Nickname", width: "135", attr: "nickName" },
      { name: "Brand name", width: "120", attr: "brandName", className: "textCapitalize" },
      { name: "Account type", width: "120", attr: "accountType", className: "textCapitalize" },
    ],
    getRecord: (params: any) => this.getSearchResult(params),
    buildData: (accountList: any) => {
      return accountList.map((account: any) => {
        return {
          id: account.id,
          accountNumber: account.accountNumber,
          customerId: 'customer: ' + account.customerId,
          nickName: account.nickName,
          brandName: account.brandName,
          accountType: account.accountType,
          link: {
            id: '/customers/' + account.customerUUID + '/accounts/' + account.id
          }
        };
      });
    }
  };

  customerDetails: any = {
    name: "customer",
    pk: "id",
    needServerSidePagination: true,
    pageSize: 10,
    fields: [
      { name: "ID", attr: "id", width: "50", type: "LINK" },
      { name: "Customer name", width: "120", attr: "name" },
      { name: "Customer type", width: "135", attr: "type", type: 'chip', className:"textCapitalize typeColor" },
      { name: "Gender", width: "135", attr: "gender", className: "textCapitalize" },
      { name: "Primary email", width: "120", attr: "primaryEmail" },
    ],
    getRecord: (params: any) => this.getSearchResult(params),
    buildData: (customerList: any) => {
      return customerList.map((customer: any) => {
        return {
          id: customer.id,
          name: customer.name,
          type: customer.type,
          gender: customer.gender,
          primaryEmail: customer.primaryEmail,
          link: {
            id: '/customers/' + customer.uuid
          }
        };
      });
    }
  };

  constructor(private customerService: CustomerService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(async (queryParams: any) => {
      this.searchParams.search = queryParams['get']('search');
      this.searchParams.type = queryParams['get']('type');
      this.searchParams.resultType = queryParams['get']('resultType');
      this.searchParams.externalSourceSystemId = queryParams['get']('externalSourceSystemId');
    });
    if (!this.searchParams.search) this.router.navigate(['/customers']);
  }

  async getSearchResult(params: any) {
    const searchDetailsParams = {
      search: this.searchParams.search,
      type: (this.searchParams.type || '').toUpperCase(),
      externalSourceSystemId: this.searchParams.externalSourceSystemId || '',
      resultType: this.searchParams.resultType,
      ...params
    };
    return await this.customerService.getCustomerSearchDetails(searchDetailsParams).toPromise();
  }

}
