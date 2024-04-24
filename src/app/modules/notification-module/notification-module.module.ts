import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SharedModule } from 'src/app/shared/shared.module';
import { NotificationModulePageRoutingModule } from './notification-module-routing.module';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';


import { AbTestingComponent } from './components/ab-testing/ab-testing.component';
import { AbTestingResultComponent } from './components/ab-testing/ab-testing-result/ab-testing-result.component';
import { ConfigTemplate } from './components/config-template/config-template';
import { TempCreate } from './components/config-template/temp-create/temp-create';
import { TempCreatePopupModalComponent } from './components/config-template/temp-create-popup-modal/temp-create-popup-modal.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { ConfigCategoryCreateUpdateComponent } from './components/configuration/config-category-create-update/config-category-create-update';
import { ConfigCategoryDeleteModalComponent } from './components/configuration/config-category-delete-modal/config-category-delete-modal.component';
import { ConfigNavigationCompComponent } from './components/configuration/config-navigation-comp/config-navigation-comp.component';
import { ErrorComponent } from './components/error/error.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { DynamicTagsModelComponent } from './components/models/dynamic-tags-model/dynamic-tags-model.component';
import { MultiSelectDropdownComponent } from './components/multi-select-dropdown/multi-select-dropdown.component';
import { NotificationUiComponent } from './components/notification-ui/notification-ui.component';
import { NotificationUiCreateComponent } from './components/notification-ui/notification-ui-create/notification-ui-create.component';
import { NotificationHistoryComponent } from './components/notification-ui/notification-history/notification-history.component';
import { QueueComponent } from './components/queue/queue.component';
import { QuillEditorImageSelectComponent } from './components/quill-editor-image-select/quill-editor-image-select.component';
import { RecentlySentComponent } from './components/recently-sent/recently-sent.component';
import { RetryModalPopupComponent } from './components/retry-modal-popup/retry-modal-popup.component';
import { RetryModalPopupComponentComponent } from './components/retry-modal-popup-component/retry-modal-popup-component.component';
import { TemplatePageComponent } from './components/template-page/template-page.component';
import { UserBasedNotificationHistoryComponentComponent } from './components/user-based-notification-history-component/user-based-notification-history-component.component';
import { DataTableSearchCriteriaComponent } from 'src/app/modules/notification-module/components/data-table-search-criteria/data-table-search-criteria.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    NotificationModulePageRoutingModule,
    SharedModule,
    NgApexchartsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    NgxMatDatetimePickerModule,
    // MatDatepickerModule,
    // NgxMatDatetimePickerModule,



    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    MatDatepickerModule,


    NgxMatTimepickerModule,
    MatDatepickerModule,
    MatCheckboxModule
  ],
  declarations: [
    AbTestingComponent,
    AbTestingResultComponent,
    ConfigTemplate,
    TempCreate,
    TempCreatePopupModalComponent,
    ConfigurationComponent,
    ConfigCategoryCreateUpdateComponent,
    ConfigCategoryDeleteModalComponent,
    ConfigNavigationCompComponent,
    ErrorComponent,
    ImageUploadComponent,
    DynamicTagsModelComponent,
    MultiSelectDropdownComponent,
    NotificationUiComponent,
    NotificationUiCreateComponent,
    NotificationHistoryComponent,
    QueueComponent,
    QuillEditorImageSelectComponent,
    RecentlySentComponent,
    RetryModalPopupComponent,
    RetryModalPopupComponentComponent,
    TemplatePageComponent,
    UserBasedNotificationHistoryComponentComponent,
    DataTableSearchCriteriaComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NotificationModulePageModule {
  constructor() {
    console.log('NotificationModulePageModule')
  }
}
