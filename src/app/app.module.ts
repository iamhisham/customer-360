import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteConfigLoadEnd, RouteConfigLoadStart, RouteReuseStrategy, Router, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { JwtInterceptor } from './core/components/_helpers/jwt.interceptor';
import { AuthGuard } from './core/services/auth.guard';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TopHeaderComponent } from './shared/components/top-header/top-header.component';


import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatStepperModule } from '@angular/material/stepper';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CdkStepper, CdkStepperModule, STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CodemirrorModule } from 'ng2-codemirror';
import * as Beautify from 'js-beautify';
import { CookieService } from 'ngx-cookie-service';

import { SharedModule } from './shared/shared.module';
// import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { register } from 'swiper/element/bundle';
register();

@NgModule({
  declarations: [AppComponent, TopHeaderComponent],
  imports: [
    RouterModule.forRoot([]),
    IonicModule.forRoot(),
    SharedModule,
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    DragDropModule,
    AppRoutingModule,
    NgApexchartsModule,
    BrowserAnimationsModule,
    ClipboardModule,
    HttpClientModule,
    CdkStepperModule,
    NgxMatSelectSearchModule,
    BrowserAnimationsModule,
    NgxMatNativeDateModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatSortModule,
    MatTableModule,
    MatIconModule,
    MatNativeDateModule,
    MatStepperModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatOptionModule,
    MatDatepickerModule,
    MatButtonModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    DatePipe,
    AuthGuard,
    CookieService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
    CdkStepper,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: 'Beautify', useValue: Beautify }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
