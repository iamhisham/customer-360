import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardModulePageRoutingModule } from './dashboard-module-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReportsComponentComponent } from './components/reports-component/reports-component.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardModulePageRoutingModule
  ],
  declarations: [
    DashboardComponent,
    ReportsComponentComponent
  ]
})
export class DashboardModulePageModule {
  constructor() {
    console.log('DashboardModulePageModule')
  }
}
