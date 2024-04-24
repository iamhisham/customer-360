import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { NotificationService } from 'src/app/modules/notification-module/services/notification.service';
import { ConstantService } from 'src/app/service/constant.service';

@Component({
  selector: 'app-config-template',
  templateUrl: './config-template.html',
  styleUrls: ['./config-template.scss'],
})
export class ConfigTemplate implements OnInit {

  templateTableDetails: any = {
    name: "template",
    pk: "id",
    search: "",
    needServerSidePagination: true,
    pageSize: 10,
    skipDefaultApiTrigger: true,
    embed: this.constantService.TEMPLATE.GET_ALL.embed,
    orderBy: "updatedAt desc",
    fields: [
      { name: "ID", attr: "id", width: "75", filterType: 'ID', type: "LINK" },
      { name: "Template Name", attr: "name", width: "175", filterType: 'TEXT', filterAttr: 'name', },
      {
        name: "Category", attr: "category", width: "175", filterType: 'ENUMS',
        filterEnums: [], filterAttr: 'categoryId', sortAttr: 'category.name'
      },
      {
        name: "Status", attr: "status", width: "175", filterType: 'ENUMS',
        filterEnums: [
          { value: "ACTIVE", name: "Active" },
          { value: "DISABLED", name: "Disabled" }
        ]
      },
      {
        name: "Channels", attr: "channels", width: "175", type: "IMAGE_LIST", disableSort: true,
      },
      { name: "Updated Time", attr: "updatedAt", width: "175", type: "DATE", format: this.notifiService.date_time_format, filterType: 'DATETIME' }
    ],
    
    actions: [
      { name: 'Edit', attr: 'edit' },
      { name: 'Clone', attr: 'clone' },
      { name: 'Disable', clickFunction: (el: any) => this.confirmDelete(el, 'disabled') }
    ],
    getRecord: (params: any) => this.notifiService.getAllTemplate(params),
    buildData: (templateList: any) => {
      return templateList.map((template: any) => {
        var channels: any = [];
        if (template.channels.indexOf('EMAIL') !== -1) channels.push({ title: "Email", name: 'mail-outline' });
        if (template.channels.indexOf('WEB_PUSH') !== -1) channels.push({ title: "Web Push", name: 'desktop-outline' });
        if (template.channels.indexOf('MOBILE_PUSH') !== -1) channels.push({ title: "Mobile Push", name: 'phone-portrait-outline' });
        if (template.channels.indexOf('SMS') !== -1) channels.push({ title: "SMS", name: 'chatbox-ellipses-outline' });
        if (template.channels.indexOf('IN_APP_MESSAGE') !== -1) channels.push({ title: "In App", name: 'apps-outline' });

        return {
          id: template.id,
          name: template.name,
          category: template.category.name,
          channels: channels,
          updatedAt: template.updatedAt,
          link: {
            id: '/notification-center/template/' + template.id
         },
          action: {
            edit: '/notification-center/template/' + template.id,
            clone: '/notification-center/template/clone/' + template.id,
          },
          additionalData: {
            categoryId: template.categoryId
          }
        };
      });
    }
  };

  @ViewChild('template_grid') templateGrid: TableComponent | undefined;

  filterFieldList: any = [
    { name: 'ID', attr: 'id', type: 'TEXT' },
    { name: 'Name', attr: 'name-like', type: 'TEXT' },
    {
      name: 'Status', attr: 'status', type: 'MULTI_SELECT',
      values: [
        { value: 'ACTIVE', text: 'ACTIVE' },
        { value: 'DISABLED', text: 'DISABLED' }
      ]
    },
    {
      name: 'Category', attr: 'categoryId', type: 'MULTI_SELECT', isSearchable: true,
      values: []
    },

  ];
  selectedCategotyList: any = [];

  selectedTemplate: any = null;
  category_search: string = "";
  mobile_Category_Search: string = "";
  categoryList: any = [];

  filteredCategoryList: any = [];
  hideSearch: any = false;
  dataSource: any;

  isInitTriggered: boolean = false;

  constructor(private constantService: ConstantService, private router: Router, public notifiService: NotificationService, private toastController: ToastController, private alertController: AlertController,
    private actRouter: ActivatedRoute, private datePipe: DatePipe, public modalctrl: ModalController) {
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

  async init() {
    if (this.isInitTriggered) return;
    this.isInitTriggered = true;
    this.actRouter.queryParams.subscribe((params: Params) => {
      this.getAllCategory(params['category_id']);
    });
    await this.loadFilterData();
  }

  async loadFilterData() {
    const categoryList: any = await this.notifiService.getAllActiveCategoryNameList().toPromise();
    this.templateTableDetails.fields[2].filterEnums = categoryList.data.map((obj: any) => {
      return { value: obj.id, name: obj.name };
    });
  }


  getAllCategory(category_id: any) {
    this.notifiService.getAllActiveCategoryNameList().subscribe({
      next: (categoryList: any) => {
        this.categoryList = categoryList.data;
        this.filterFieldList.find((fields: any, index: any) => {
          if (fields.attr === 'categoryId') {
            this.filterFieldList[index].values = this.categoryList.map((data: any) => {
              return { value: data.id, text: data.name };
            });
          }
        });
      },
      error: (err: any) => {
        this.notifiService.hideLoader();
        err = err.error || err;
        this.notifiService.toster.error(err.message || 'Failed');
      }
    });
  }


  deleteTemplate(id: any) {
    this.notifiService.showLoader();
    this.notifiService.deleteTemplateById(id).subscribe({
      next: async (data: any) => {
        this.notifiService.toster.success("Template Disabled successfully!");
        await this.templateGrid?.init();
        this.notifiService.hideLoader();
      },
      error: (err: any) => {
        this.notifiService.hideLoader();
        err = err.error || err;
        this.notifiService.toster.error(err.message || "Template disable Failed");
      }
    });
  }

  async confirmDelete(template: any, status?: any) {
    this.selectedTemplate = template;
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
            this.deleteTemplate(template.id);
          }
        },
      ],
    });
    await alert.present();
  }

  removeCategorydata(categoryID: any, type?: any) {
    if (categoryID) {
      this.selectedCategotyList.splice(this.selectedCategotyList.findIndex((data: any) => data === categoryID), 1);
    } else {
      this.selectedCategotyList = this.categoryList.map((category: any) => category.id);
    }

    if (type != undefined) {
      this.selectedCategotyList = [];
    }
  }

  hideAndSearch() {
    this.hideSearch = !this.hideSearch;
    this.category_search = "";
  }

  categoryFilter() {
    if (this.category_search != '') {
      let categoryList = this.categoryList.filter((categoryList: any) => { return categoryList.name.includes(this.category_search) });
      return categoryList.length == 0 ? true : false;
    }
    return false;
  }
  onClose() {
    this.modalctrl.dismiss();
  }

  navigateByUrl() {
    this.router.navigate(['notification-center/template/create'])
  }
}
