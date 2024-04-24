import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../../../../service/common.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as saveAs from 'file-saver';
import { SourceSystemService } from '../../services/source-system.service';
import { SchedulerService } from '../../services/scheduler.service';
import { NotificationService } from 'src/app/modules/notification-module/services/notification.service';

@Component({
  selector: 'app-source-system',
  templateUrl: './source-system.component.html',
  styleUrls: ['./source-system.component.scss'],
})
export class SourceSystemComponent implements OnInit {

  //sourceSystemList
  sourceSystems: any;
  sourceSystemList: any;

  //delete veriables
  deleteConformation = false;

  isImportModel = false;

  importData: any = {
    type: 'CDP'
  };
  errorMessage = '';
  mappedSourceObjectList: any;
  formData = new FormData();

  moduleData = [
    {
      name: 'CDP Customer',
      attr: 'cdp-customer'
    },
    {
      name: 'CDP Order and Fulfilment',
      attr: 'cdp-order-and-fulfilment'
    },
    {
      name: 'CDP Payment',
      attr: 'cdp-payment'
    },
    {
      name: 'CDP Subscription',
      attr: 'cdp-subscription'
    },
    {
      name: 'CDP Case',
      attr: 'cdp-case'
    },
    {
      name: 'CDP Loyalty Program',
      attr: 'cdp-loyalty-program'
    },
    {
      name: 'CDP Segments',
      attr: 'cdp-segments'
    },
    {
      name: 'CDP CRM',
      attr: 'cdp-crm'
    },
    {
      name: 'CDP Task',
      attr: 'cdp-task'
    },
    {
      name: 'CDP Notification',
      attr: 'cdp-notification'
    },
    {
      name: 'CDP Interaction History',
      attr: 'cdp-interaction-history'
    },
  ]
  searchSourceSystemName: any;
  @ViewChild('fileInputCDP') fileInputCDP: ElementRef | any;
  @ViewChild('fileInputCSV') fileInputCSV: ElementRef | any;
  constructor(private sourceSystemService: SourceSystemService, private schedulerService: SchedulerService,
    public commonService: CommonService, private router: Router, public notifiService: NotificationService) {
    this.importData.type = this.importData.type || 'CDP';
  }

  ngOnInit() {
    this.init();
  }
  ionViewWillEnter() {
    this.init();
  }
  async init() {
    await Promise.all([
      this.getAllInstalledConnectorList(),
      this.getExternalSourceSystem()
    ]);
  }
  async getAllInstalledConnectorList() {
    this.sourceSystems = null
    this.sourceSystems = (await this.sourceSystemService.getAllInstalledConnectors().toPromise() as any).data;
  }

  openAddSourceSystem() {
    this.router.navigate(['/data-setup/source-system/config'])
  }

  async openDeleteModal(isOpen: any, data?: any) {
    this.sourceSystems.id = data.id;
    this.deleteConnector();
    await this.sourceSystemService.getAllSourceSystemsIdAndName(false);
  }

  async deleteConnector() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    });

    await swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert SourceSystem!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete SourceSystem!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: "#5164b8",
      cancelButtonColor: "#d33",
      reverseButtons: true
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        this.commonService.showLoader();
        try {
          await this.sourceSystemService.deleteInstalledConnectors(this.sourceSystems.id).toPromise();
          this.commonService.hideLoader();
          this.getAllInstalledConnectorList();
          Swal.fire({
            title: 'Deleted!',
            text: 'SourceSystem has been removed.',
            icon: 'success'
          });
        } catch (e: any) {
          this.commonService.hideLoader();
          this.commonService.toster.error(e.error?.error?.message || e.message || e || 'Delete Failed');
        }
      }
    });
  }

  async showEditMapping(connector: any) {
    const sourceObj = connector;
    this.router.navigate(['/data-setup/source-system/config', connector.uuid], {
      state: { sourceObj },
    });
    await this.sourceSystemService.getAllSourceSystemsIdAndName(false);
  }

  openImportModel(isOpen: boolean) {
    this.importData.type = this.importData.type || 'CDP';
    this.isImportModel = isOpen;
  }

  getExternalSourceSystem() {
    this.sourceSystemService.getExternalSourceSystems().subscribe({
      next: (result: any) => {
        this.sourceSystemList = result.data;
      },
      error: (err: any) => {
        err = err.error || err;
      }
    });
  }

  switchImportType(type: any) {
    this.importData = {};
    this.importData.type = type;
    this.formData = new FormData();
  }

  async importDataExcelOrCSVFormat(event: any) {
    const file = event.target.files[0];
    this.importData.excel = '';
    this.importData.csv = '';
    if (file) {
      try {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension !== 'xlsx' && fileExtension !== 'xls' && this.importData.type === 'CDP') throw "Please select an Excel sheet"
        if (fileExtension !== 'csv' && this.importData.type === 'SOURCE_SYSTEM') throw "Please select an CSV file"
        this.importData.fileName = file.name;
        this.formData.append('file', file, file.name);
        const fieldName = this.importData.type === 'CDP' ? 'excel' : 'csv';
        this.importData[fieldName] = file.name;
      } catch (err) {
        this.importData.excel = null;
        this.importData.csv = null;
        this.commonService.toster.error(err);
      }
    }
  }

  validateImportData() {
    this.errorMessage = '';
    if (!this.importData.cdpModuleName && this.importData.type == 'CDP') { this.errorMessage = 'Module name is manditory'; return false }
    else if (!this.importData.externalSourceId) { this.errorMessage = 'Source name is manditory'; return false }
    else if (this.importData.type == 'CDP' && !this.importData.excel) { this.errorMessage = 'Please Upload EXCEL Sheet'; return false }
    else if (this.importData.type != 'CDP' && !this.importData.csv) { this.errorMessage = 'Please Upload CSV File'; return false; }
    else { this.errorMessage = ''; return true; }
  }

  async submitImportedtData() {
    try {
      if (!this.validateImportData()) return;
      this.commonService.showLoader();
      let importPromise;
      if (this.importData.type === 'CDP') {
        importPromise = this.sourceSystemService.createImportedDataByCDP(this.importData, this.formData).toPromise();
      } else {
        importPromise = this.sourceSystemService.createImportedDataBySourceSystem(this.importData, this.formData).toPromise();
      }
      await importPromise;
      this.commonService.hideLoader();
      this.openImportModel(false);
      this.commonService.toster.success('Successfully Created');
    } catch (e: any) {
      this.commonService.hideLoader();
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
      this.openImportModel(false);
    } finally {
      this.importData = [];
      this.formData = new FormData();
      this.commonService.hideLoader();
    }
  }

  async loadSourceSystem(sourceSystemID: any) {
    this.commonService.showLoader();
    try {
      if (this.importData.type == 'SOURCE_SYSTEM') {
        const attr: any = await this.sourceSystemService.getFlowChartAttribute(sourceSystemID).toPromise();
        this.mappedSourceObjectList = attr.sourceName;
      }
    } catch (e: any) {
      this.commonService.hideLoader();
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    } finally {
      this.commonService.hideLoader();
    }
  }

  downloadUploadedFile() {
    if (this.importData.type == 'CDP') {
      try {
        // if (!this.validateImportData()) return;
        this.commonService.showLoader();
        this.sourceSystemService.downloadUploadedFile(this.importData.cdpModuleName).subscribe(
          (data: any) => {
            saveAs(data, `${this.importData.cdpModuleName}.xlsx`);
            this.commonService.hideLoader();
            Swal.fire({
              icon: 'success',
              title: 'File export Successfully!',
              showConfirmButton: false,
              timer: 1500
            });
          },
          (e: any) => {
            this.commonService.hideLoader();
            this.commonService.toster.error((e.error?.error?.message || e.message || e) || 'File export Failed');
            console.error('Failed:', e);
          }
        );
      } catch (e: any) {
        this.commonService.hideLoader();
        this.commonService.toster.error('An error occurred: ' + (e.error?.error?.message || e.message || e));
      }
    }
  }

  viewImportedHistory() {
    this.router.navigateByUrl('/data-setup/source-system/imported-history')
  }
  clearFileSelection() {
    this.importData.fileName = '';
    if (this.importData.type == 'CDP') {
      const fileInput = this.fileInputCDP.nativeElement;
      fileInput.value = '';
    }
    if (this.importData.type != 'CDP') {
      const fileInput = this.fileInputCSV.nativeElement;
      fileInput.value = '';
    }
    this.importData.excel = '';
  }
}
