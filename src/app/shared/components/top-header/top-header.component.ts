import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../../../service/common.service';
import { AlertController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../modules/customer-module/services/customer.service';
import { SourceSystemService } from '../../../modules/datasetup-module/services/source-system.service';

@Component({
  selector: 'app-top-header',
  templateUrl: './top-header.component.html',
  styleUrls: ['./top-header.component.scss'],
})
export class TopHeaderComponent implements OnInit {

  externalSourceSystemList: any = [];
  searchTimer: any = null;
  customerSearchedDetails: any = {};
  userListDropdown: any = { // dropdown popover
    details: 'serviceAgent'
  };
  userName: any;
  userNameLogo: any;
  suggestionList = [
    { label: 'name', iconName: 'person-outline', placeholder: 'Please enter name', value: 'Name', example: 'John Doe' },
    { label: 'email', iconName: 'mail-outline', placeholder: 'Please enter email address', value: 'Email Address', example: 'james@web-3.in' },
    { label: 'phone', iconName: 'call-outline', placeholder: 'Please enter phone number', value: 'Phone Number', example: '3456789012' },
    { label: 'account_number', iconName: 'people-outline', placeholder: 'Please enter account number', value: 'Account Number', example: 'ACCT-00009' },
    { label: 'subscription_number', iconName: 'duplicate-outline', placeholder: 'Please enter subscription number', value: 'Subscription Number', example: '100987635' },
    { label: 'customer_id', iconName: 'person-outline', placeholder: 'Please enter customer id', value: 'Customer ID', example: '12' },
    { label: 'order_Id', iconName: 'cart-outline', placeholder: 'Please enter order id', value: 'Order ID', example: '17' },
    { label: 'subscription_Id', iconName: 'medkit-outline', placeholder: 'Please enter subscription id', value: 'Subscription ID', example: '11' },
  ];
  isRetryApi = true;
  @ViewChild('searchInput') searchInput!: ElementRef;
  constructor(private customerService: CustomerService, public commonService: CommonService,
    private authService: AuthService, private sourceSystemService: SourceSystemService,
    private popoverController: PopoverController, private router: Router, private alertController: AlertController) {
    this.getUserName();
  }

  ngOnInit() {
    this.getExternalSource();
  }

  async getUserName() {
    this.userName = await this.commonService.storage.get('username');
    const [firstNameFirstLtr, secondNameFirstLtr]: any = this.userName.split(' ');
    this.userNameLogo = firstNameFirstLtr[0] + secondNameFirstLtr[0];
  }

  showSearchPopover() {
    this.getExternalSource();
    this.commonService.showCustomerSearchPopover = true;
  }

  selectSuggestion(obj: any, type: any) {
    if (type == 'TYPE') {
      this.customerSearchedDetails.type = obj.label;
      this.customerSearchedDetails.placeholder = obj.placeholder;
    } else if (type == 'EXTERNAL_SOURCE_SYSTEM_NAME') {
      this.customerSearchedDetails.externalSourceSystemName = obj.name;
      this.customerSearchedDetails.externalSourceSystemId = obj.id;
    }
    this.searchInput.nativeElement.focus();
  }

  async getExternalSource() {
    this.externalSourceSystemList = await this.sourceSystemService.getAllSourceSystemsIdAndName(true);
  }

  removeSearchType(type?: any) {
    if (type == 'TYPE') {
      this.customerSearchedDetails = {};
    } else if (type == 'EXTERNAL_SOURCE_SYSTEM_NAME') {
      this.customerSearchedDetails = {
        type: this.customerSearchedDetails.type,
        placeholder: this.customerSearchedDetails.placeholder
      };
    }
  }

  triggerSearchOnEnter() {
    if (this.customerSearchedDetails.type && this.customerSearchedDetails.search?.length > 0 && !this.customerSearchedDetails.isSeachInprogress && !this.customerSearchedDetails.customers) {
      this.searchCustomer(true);
    }
  }

  async searchCustomer(isImmediateSearch: boolean = false) {
    var { search, previousSearch, type, externalSourceSystemId } = this.customerSearchedDetails;
    search = search.trim();

    delete this.customerSearchedDetails.customers;
    delete this.customerSearchedDetails.accounts;
    delete this.customerSearchedDetails.accountRecords;
    delete this.customerSearchedDetails.customerRecords;

    if (!isImmediateSearch && search.length < 3) {
      this.customerSearchedDetails.isSeachInprogress = false;
      this.customerSearchedDetails.previousSearch = '';
    }

    if (isImmediateSearch || (!type && search.length >= 3 && search != previousSearch)) {
      this.customerSearchedDetails.previousSearch = search;
      this.customerSearchedDetails.isSeachInprogress = true;
      const _search = async () => {
        if (search) {
          const result: any = await this.customerService.getCustomerSearchDetails({ search, type: (type || '').toUpperCase(), externalSourceSystemId: externalSourceSystemId || '' }).toPromise();
          if (search == this.customerSearchedDetails.search.trim() && type == this.customerSearchedDetails.type) {
            this.customerSearchedDetails.isSeachInprogress = false;
            this.customerSearchedDetails.customers = result.customers;
            this.customerSearchedDetails.accounts = result.accounts;
            this.customerSearchedDetails.accountRecords = result.accountRecords;
            this.customerSearchedDetails.customerRecords = result.customerRecords;
          }
        }
      }
      if (this.searchTimer) clearTimeout(this.searchTimer);

      if (isImmediateSearch) await _search();
      else this.searchTimer = setTimeout(_search, 500);
    }

  }

  resetPopover() {
    this.commonService.showCustomerSearchPopover = false;
    this.customerSearchedDetails = {};
  }

  selectCustomer(customer: any) {
    this.router.navigate(['/customers/' + customer.uuid]);
    this.resetPopover();
  }

  selectAccount(account: any) {
    this.router.navigate(['/customers/' + account.customerUUID + '/accounts/' + account.id]);
    this.resetPopover();
  }

  showMoreSearchResults(resultType: any) {
    const { search, type, externalSourceSystemId } = this.customerSearchedDetails;
    this.router.navigate(['/customers/search/expand'], {
      queryParams: { search, type, externalSourceSystemId, resultType }
    });
    this.resetPopover();
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: TopHeaderComponent,
      event: ev,
      translucent: true,
      componentProps: {
        onUserChange: this.onUserChange.bind(this),
      },
    });
    return await popover.present();
  }

  onUserChange(event: any) {
    if (event === 'logout') {
      this.logOutConformation();
    }
  }

  async logOutConformation() {
    this.popoverController.dismiss();
    const alert = await this.alertController.create({
      header: 'Log Out',
      subHeader: 'You will be returned to the login screen.',
      cssClass: 'custom-alert-style',
      buttons: [
        {
          text: 'Cancel',
          cssClass: 'alert-button-cancel btn-secondary',
        },
        {
          text: 'Logout',
          cssClass: 'alert-button-confirm btn-primary',
          handler: () => {
            this.popoverController.dismiss();
            this.authService.deleteLoginDetails();
            this.router.navigate(['/auth/logout']);
          },
        },
      ],
    });
    await alert.present();
  }
}
