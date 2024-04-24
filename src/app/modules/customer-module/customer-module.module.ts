import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgApexchartsModule } from 'ng-apexcharts';

import { CustomerModulePageRoutingModule } from './customer-module-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { BillingComponent } from './components/billing/billing.component';
import { CustomersComponent } from './components/customers/customers.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { OrdersComponent } from './components/orders/orders.component';
import { OverviewComponent } from './components/overview/overview.component';
import { TicketsComponent } from './components/tickets/tickets.component';
import { UsageAndBalanceComponent } from './components/usage-and-balance/usage-and-balance.component';
import { SearchCustomerComponent } from './components/search-customer/search-customer.component';
import { CustomerSearchComponentPageComponent } from './components/customer-search-component-page/customer-search-component-page.component';
import { RecentlyViewedComponent } from './components/recently-viewed/recently-viewed.component';
import { UsersegmentComponent } from './components/usersegment/usersegment.component';
import { UsersegmentCreateComponent } from './components/usersegment/usersegment-create/usersegment-create.component';
import { SegmentViewPopupComponentComponent } from './components/usersegment/segment-view-popup-component/segment-view-popup-component.component';
import { InteractionHistoryComponent } from './components/interaction-history/interaction-history.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CustomerModulePageRoutingModule,
    SharedModule,
    MatDatepickerModule,
    NgxMatDatetimePickerModule,
    NgApexchartsModule
  ],
  declarations: [
    BillingComponent,
    CustomersComponent,
    NotificationsComponent,
    OrdersComponent,
    OverviewComponent,
    TicketsComponent,
    UsageAndBalanceComponent,
    SearchCustomerComponent,
    CustomerSearchComponentPageComponent,
    RecentlyViewedComponent,
    UsersegmentComponent,
    UsersegmentCreateComponent,
    SegmentViewPopupComponentComponent,
    InteractionHistoryComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CustomerModulePageModule {
  constructor() {
    console.log('CustomerModulePageModule')
  }
}
