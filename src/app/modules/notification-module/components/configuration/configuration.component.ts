import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ConfigCategoryDeleteModalComponent } from './config-category-delete-modal/config-category-delete-modal.component';
import { NotificationService } from 'src/app/modules/notification-module/services/notification.service';
import { AlertController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { ConstantService } from 'src/app/service/constant.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
  categoryTableDetails: any = {
    name: "category",
    pk: "id",
    needServerSidePagination: true,
    pageSize: 10,
    orderBy: "updatedAt desc",
    embed: this.constantService.CATEGORY.GET_ALL.embed,
    fields: [
      { name: "ID", attr: "id", width: "75", filterType: 'ID' },
      { name: "Name", attr: "name", width: "175", filterType: 'TEXT' },
      {
        name: "Priority", attr: "priority", width: "135", className: "textCapitalize", filterType: 'ENUMS',
        filterEnums: [
          { value: "MANDATORY", name: "Mandatory" },
          { value: "MEDIUM", name: "Medium" },
          { value: "LOW", name: "Low" }
        ]
      },
      {
        name: "Status", attr: "status", width: "135", filterType: 'ENUMS',
        filterEnums: [
          { value: "ACTIVE", name: "Active" },
          { value: "DISABLED", name: "Disabled" }
        ]
      },
      { name: "Rate Limit", attr: "rateLimit", width: "135", className: "textCapitalize" },
      { name: "Updated Time", attr: "updatedAt",  type: "DATE", format: this.notifiService.date_time_format, width: "175", filterType: 'DATETIME' },
      
    ],
    actions: [
      { name: "Edit", attr: 'edit', },
      { name: "Clone", attr: 'clone', },
      { name: "View Template", attr: 'view', },
      { name: "Disable", clickFunction: (el: any) => this.confirmDelete(el, 'disabled') }
    ],
    getRecord: (params: any) => this.notifiService.getAllCategory(params),
    buildData: (categoryList: any) => {
      return categoryList.map((category: any) => {
        return {
          id: category.id,
          name: category.name,
          priority: category.priority,
          status: category.status,
          rateLimit: category.rateLimit || '-',
          updatedAt: category.updatedAt,
          action: {
            view: '/notification-center/template',
            edit: '/notification-center/category/' + category.id,
            clone: '/notification-center/category/clone/' + category.id,
            viewTemplateQueryParam: { categoryId: category.id },
          }
        };
      });
    }
  };


  @ViewChild('category_grid') categoryGrid: TableComponent | undefined;

  selectedCategory: any = null;
  isInitTriggered: boolean = false;

  @Optional() private routerOutlet?: IonRouterOutlet;

  constructor(private constantService: ConstantService, private router: Router, public notifiService: NotificationService, private modalController: ModalController, private route: Router,
    private alertController: AlertController, private datePipe: DatePipe, public modalctrl: ModalController) {
  }

  ngOnInit() {
    this.init();
  }

  ionViewWillEnter() {
    this.init();
  }

  ionViewWillLeave() {
    this.isInitTriggered = false;
    this.notifiService.closeAllAlertCtrl();
  }

  init() {
    if (this.isInitTriggered) return;
    this.isInitTriggered = true;
  }

  deleteCategory(id: any) {
    this.notifiService.showLoader();
    this.notifiService.deleteCategoryById(id).subscribe({
      next: async (data: any) => {
        this.notifiService.toster.success('Category Disabled successfully!');
        await this.categoryGrid?.init();
        this.notifiService.hideLoader();
      },
      error: async (err: any) => {
        this.notifiService.hideLoader();
        err = err.error?.error || err.error || err;
        if (err.code == 1001) {
          await this.openActionDeniedModel();
        } else {
          this.notifiService.toster.error(err.message || 'Category Disable Failed');
        }
      }
    });
  }

  async confirmDelete(category: any, status?: any) {
    this.selectedCategory = category;
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      subHeader: `Changes you made will be ${status}.`,
      cssClass: 'custom-alert-style',
      buttons: [
        {
          text: 'Cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Disable',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.deleteCategory(category.id);
          }
        },
      ],
    });
    await alert.present();
  }

  async openActionDeniedModel() {
    let categoryList: any = await this.notifiService.getAllActiveCategoryNameList().toPromise();
    const modal = await this.modalController.create({
      component: ConfigCategoryDeleteModalComponent,
      cssClass: 'sizeModal',
      componentProps: {
        category: this.selectedCategory,
        categoryList: categoryList.data.filter((category: any) => category.id != this.selectedCategory.id),
        deleteEvent: (id: any) => {
          this.deleteCategory(id);
        }
      },
      backdropDismiss: false
    });
    await modal.present();
  }

}
