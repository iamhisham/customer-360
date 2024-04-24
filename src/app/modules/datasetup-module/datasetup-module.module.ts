import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatasetupModulePageRoutingModule } from './datasetup-module-routing.module';
import { ImportedHistoryComponent } from './components/source-system/imported-history/imported-history.component';
import { SourceSystemComponent } from './components/source-system/source-system.component';
import { SourceSystemMappingComponent } from './components/source-system/source-system-mapping/source-system-mapping.component';
import { SchedularHistoryComponent } from './components/scheduler/schedular-history/schedular-history.component';
import { SchedulerComponent } from './components/scheduler/scheduler.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { AdvanceAuditLogSearchComponent } from './components/audit-log/advance-audit-log-search/advance-audit-log-search.component';
import { ExtensionComponent } from './components/audit-log/extension/extension.component';
import { FlowChartComponent } from './components/flow-chart/flow-chart.component';
import { ProgressBarComponentComponent } from './components/progress-bar-component/progress-bar-component.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SchedulerCreateComponent } from './components/scheduler/scheduler-create/scheduler-create.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatasetupModulePageRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatDatepickerModule,
    MatStepperModule,
    MatInputModule,
    SharedModule,
  ],
  declarations: [
    SchedulerComponent,
    SchedularHistoryComponent,
    SchedulerCreateComponent,
    SchedularHistoryComponent,
    AuditLogComponent,
    AdvanceAuditLogSearchComponent,
    ExtensionComponent,
    ImportedHistoryComponent,
    SourceSystemComponent,
    SourceSystemMappingComponent,
    FlowChartComponent,
    ProgressBarComponentComponent,
  ]
})
export class DatasetupModulePageModule {
  constructor() {
    console.log('DatasetupModulePageModule');
  }
}
