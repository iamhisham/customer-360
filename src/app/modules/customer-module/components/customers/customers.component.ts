import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ConstantService } from '../../../../service/constant.service';
import { OrdersService } from '../../services/orders.service';
import { CommonService } from '../../../../service/common.service';
import { ClipBoardService } from '../../services/clip-board.service';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {
  customerUUID: any = null;
  accountId: any = null;
  selectedTab: string = 'Overview';
  selectedTabList: any[] = ['Overview'];
  customer: any = {};
  account: any = {};
  outstandingWalletGoldData: any = {};
  isInitTriggered: boolean = false;
  popoverContent: any[] = [];
  isOpen: boolean = false;
  currentScrollPosition: number = 0;
  selectedList: any;
  nickName: any;
  modelList: any = { isAccountEditModal: false };
  @ViewChild('OrdersComponent', { static: false }) OrdersComponent: any;
  @ViewChild('NotificationsComponent', { static: false }) NotificationsComponent: any;
  @ViewChild('BillingComponent', { static: false }) BillingComponent: any;
  @ViewChild('overviewComponent', { static: false }) overviewComponent: any;
  @ViewChild('TicketsComponent', { static: false }) TicketsComponent: any;
  @ViewChild('usageAndBalance', { static: false }) UsageAndBalance: any;
  @ViewChild('InteractionHistoryComponent', { static: false }) InteractionHistoryComponent: any;
  @ViewChild('popover') popover: any;
  @ViewChild('swiper', { read: ElementRef }) public swiper!: ElementRef<any>;
  Object: any;
  scrollCardWidth = 300;
  cardsToMove = 2;
  errorStatus: number | undefined;

  constructor(private commonService: CommonService, private route: ActivatedRoute, private constantService: ConstantService,
    public customerService: CustomerService, private orderService: OrdersService, private clipBoardService: ClipBoardService,
    private router: Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(async (params: Params) => {
      this.customerUUID = params['get']('customer_uuid');
      this.accountId = params['get']('account_id');
    });
    this.init();
  }

  ionViewWillEnter() {
    this.init();
  }

  ionViewWillLeave() {
    this.isInitTriggered = false;
  }
  ngAfterViewInit() {
    this.init();
  }

  init() {
    if (this.isInitTriggered) return;
    this.isInitTriggered = true;

    if (!this.customerUUID && !this.accountId) this.commonService.showCustomerSearchPopover = true;
    this.loadCustomerData()
  }

  async loadCustomerData() {
    try {
      if (this.customerUUID) {
        this.customer = await this.customerService.getCustomerByUUID(this.customerUUID, this.constantService.CONST.CUSTOMER.EMBED_CONTACT_DETAILS).toPromise();
        await this.buildPrimaryContact(this.customer);
        if (this.customer.type == "CUSTOMER" && this.customer.accounts && this.customer.accounts.length) {
          await this.switchAccount(this.customer.accounts.find((account: any) => account.id == this.accountId) || this.customer.accounts[0], true);
        }
      }
    } catch (e: any) {
      this.errorStatus = (e.error?.error?.message || e.message || e);
    }
  }

  async switchAccount(account: any, isAutoSwitch: boolean = false) {
    if (this.accountId !== account.id) {
      this.accountId = account.id;
      this.selectedTabList = [this.selectedTab];
      this.getCustomerByIdWithAccountId();
      this.getOutstandingAmountByCustomerIdWithAccountId();
      if (this.overviewComponent) this.overviewComponent.init(this.accountId);
      if (this.BillingComponent) this.BillingComponent.init(this.accountId);
      if (this.TicketsComponent) this.TicketsComponent.init(this.accountId);
      if (this.UsageAndBalance) this.UsageAndBalance.init(this.accountId);
      if (this.OrdersComponent) this.OrdersComponent.init(this.accountId);
      if (this.NotificationsComponent) this.NotificationsComponent.init(this.accountId);
      if (this.InteractionHistoryComponent) this.InteractionHistoryComponent.init(this.accountId);
      if (isAutoSwitch) {
        this.autoScollToAccount();
      }
    }
  }

  autoScollToAccount() {
    setTimeout(() => {
      const compDom: any = document.querySelector('app-customers:not(.ion-page-hidden)');
      const element: any = compDom.querySelector(`#account-${this.accountId}`);
      if (element) {
        const leftElement: any = document.querySelector('#left-element');
        const rightElement: any = document.querySelector('#right-element');
        this.swipeAccountSelect(element, element.parentNode.parentNode, leftElement, rightElement, 300);
      }
    }, 0);
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
    if (this.selectedTabList.indexOf(tab) == -1) this.selectedTabList.push(tab);
  }

  async getCustomerByIdWithAccountId() {
    this.account = null;
    this.account = await this.customerService.getCustomerByIdWithAccountId(this.customer.id, this.accountId, this.constantService.CONST.CUSTOMER.EMBED_CONTACT_DETAILS_ACCOUNT).toPromise();
    if (this.account) {
      await this.buildPrimaryContact(this.account);
    }
  }
  async getOutstandingAmountByCustomerIdWithAccountId() {
    this.outstandingWalletGoldData = null;
    this.outstandingWalletGoldData = await this.orderService.getInvoiceOutstandingAmountByCustomerIdWithAccountId(this.customer.id, this.accountId).toPromise();
  }

  async buildPrimaryContact(obj: any) {
    try {
      obj.isContactLoaded = true;
      obj.contactPointEmails = obj.contactPointEmails.filter((_obj: any) => _obj.isActive);
      obj.contactPointPhones = obj.contactPointPhones.filter((_obj: any) => _obj.isActive);
      obj.contactPointAddresses = obj.contactPointAddresses.filter((_obj: any) => _obj.isActive);
      obj.primaryEmail = obj.contactPointEmails.find((_obj: any) => _obj.isPrimaryEmail) || obj.contactPointEmails[0];
      obj.primaryPhone = obj.contactPointPhones.find((_obj: any) => _obj.isPrimaryPhone) || obj.contactPointPhones[0];
      obj.primaryAddress = obj.contactPointAddresses.find((_obj: any) => _obj.isPrimaryAddress) || obj.contactPointAddresses[0];
      if (obj.primaryEmail) obj.primaryEmail.isPrimary = true;
      if (obj.primaryPhone) obj.primaryPhone.isPrimary = true;
      if (obj.primaryAddress) obj.primaryAddress.isPrimary = true;
      obj.contactPointAddresses.forEach((_obj: any) => {
        _obj.address = [_obj.addressLine1, _obj.addressLine2, _obj.addressLine3, _obj.street, _obj.city, _obj.state, _obj.stateProvince, _obj.country, _obj.postalCode,].filter(Boolean).join(', ');
      });
      obj.contactPointPhones.forEach((_obj: any) => {
        // _obj.extWithNumber = (_obj.extensionNumber ? `+ (${_obj.extensionNumber})-` : '') + (_obj.telephoneNumber || '');
        _obj.extWithNumber = (_obj.extensionNumber || '') + (_obj.telephoneNumber || '');
      });
      this.customerService.customerDetails = {
        name: this.customer.name,
        email: (this.customer.primaryEmail?.email || ''),
        phone: (this.customer.primaryPhone?.extWithNumber || '')
      };
      const [fName, sName]: any = obj.name.split(' ');
      this.customerService.customerNameLogo = fName[0] + sName[0];
    } catch (e: any) {
      console.log("ERR", (e.error?.error?.message || e.message || e));
    }
  }

  presentPopover(e: Event, popoverContentArray: any[], positionSide: string, type: string) {
    this.popover.event = e;
    this.popoverContent = popoverContentArray;
    this.popover.positionSide = positionSide;
    this.popover.alignment = positionSide === 'left' ? 'start' : 'end';
    this.popover.elementType = type;
    this.isOpen = true;
  }

  copyToClipboard(event: any) {
    this.clipBoardService.copy(this.popover.elementType, event.target.previousElementSibling.innerText, event.target.parentElement);
  }

  calculateVisibleCards() {
    const containerWidth = 817;
    return Math.floor(containerWidth / this.scrollCardWidth);
  }

  getTotalSlides() {
    return this.customer?.accounts?.length || 0;
  }

  shouldShowLeftArrow() {
    return this.currentScrollPosition > 0;
  }

  shouldShowRightArrow() {
    const totalSlides = this.getTotalSlides();
    const visibleCards = this.calculateVisibleCards();
    return (this.currentScrollPosition + 1) < totalSlides - visibleCards;
  }

  scrollRight() {
    this.swiper.nativeElement.scrollLeft += this.scrollCardWidth * this.cardsToMove;
    this.currentScrollPosition += this.cardsToMove;
  }

  scrollLeft() {
    this.swiper.nativeElement.scrollLeft -= this.scrollCardWidth * this.cardsToMove;
    this.currentScrollPosition -= this.cardsToMove;
  }

  async onSubmit(customer: any) {
    try {
      var isChangeDetected = false;
      await Promise.all(customer.accounts.map(async (account: any) => {
        const { nickName, newNickName } = account;
        if (newNickName && newNickName.trim() !== '' && newNickName !== nickName) {
          isChangeDetected = true;
          await this.customerService.updateNickNameByAccountId(customer.id, account.id, { nickName: newNickName }).toPromise();
        }
      }));
      if (isChangeDetected) {
        this.loadCustomerData();
        this.commonService.toster.success('NickName update success');
        this.modelList.isAccountEditModal = false;
      } else {
        this.commonService.toster.error('Please enter new nick name');
      }
    } catch (e: any) {
      console.error("Error: ", (e.error?.error?.message || e.message || e));
    }
  }

  async swipeAccountSelect(element: any, parentElement: any, leftElement: any, rightElement: any, animiDuration: number) {
    this.commonService.swipeAcountSelectedIntoView(element, parentElement, leftElement, rightElement, animiDuration);
  }

}
