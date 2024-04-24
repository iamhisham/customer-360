import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from 'src/app/core/services/auth.guard';

import { CustomerSearchComponentPageComponent } from 'src/app/modules/customer-module/components/customer-search-component-page/customer-search-component-page.component';
import { SearchCustomerComponent } from 'src/app/modules/customer-module/components/search-customer/search-customer.component';
import { UsersegmentComponent } from 'src/app/modules/customer-module/components/usersegment/usersegment.component';
import { UsersegmentCreateComponent } from 'src/app/modules/customer-module/components/usersegment/usersegment-create/usersegment-create.component';
import { RecentlyViewedComponent } from 'src/app/modules/customer-module/components/recently-viewed/recently-viewed.component';
import { CustomersComponent } from './components/customers/customers.component';

const routes: Routes = [
  { path: 'search', component: CustomerSearchComponentPageComponent, canActivate: [AuthGuard] },
  { path: 'search/expand', component: SearchCustomerComponent, canActivate: [AuthGuard] },

  { path: 'segments', component: UsersegmentComponent, canActivate: [AuthGuard] },
  { path: 'segments/:user_segment_id', component: UsersegmentCreateComponent, canActivate: [AuthGuard] },
  { path: 'segments/create', component: UsersegmentCreateComponent, canActivate: [AuthGuard] },
  { path: 'segments/clone/:clone_user_segment_id', component: UsersegmentCreateComponent, canActivate: [AuthGuard] },

  { path: 'recently-viewed', component: RecentlyViewedComponent, canActivate: [AuthGuard] },

  { path: ':customer_uuid', component: CustomersComponent, canActivate: [AuthGuard] },
  { path: ':customer_uuid/accounts/:account_id', component: CustomersComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'search', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerModulePageRoutingModule {}
