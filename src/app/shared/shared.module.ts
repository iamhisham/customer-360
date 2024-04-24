import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { RouterModule } from '@angular/router';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';

import { FilterPipe } from './pipe/filter.pipe';
import { CurrencyPipe } from './pipe/currency.pipe';
import { PhoneNumberPipe } from './pipe/phonenumber.pipe';
import { DurationPipePipe } from './pipe/duration-pipe.pipe';
import { HTMLToIFrameURLPipe } from './pipe/html-to-iframe-url.pipe';

import { TableComponent } from './components/table/table.component';

@NgModule({
  declarations: [
    TableComponent,
    FilterPipe,
    CurrencyPipe,
    DurationPipePipe,
    PhoneNumberPipe,
    HTMLToIFrameURLPipe,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatDatepickerModule,
    NgxMatDatetimePickerModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    MatInputModule
  ],
  providers: [DurationPipePipe, CurrencyPipe],
  exports: [
    FilterPipe,
    CurrencyPipe,
    DurationPipePipe,
    PhoneNumberPipe,
    HTMLToIFrameURLPipe,
    TableComponent
  ]

})
export class SharedModule { }
