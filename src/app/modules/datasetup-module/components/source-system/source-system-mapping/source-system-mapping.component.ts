import { DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ProgressBarComponentComponent } from 'src/app/modules/datasetup-module/components/progress-bar-component/progress-bar-component.component';
import { CommonService } from 'src/app/service/common.service';
import { SchedulerService } from 'src/app/modules/datasetup-module/services/scheduler.service';
import { SourceSystemService } from 'src/app/modules/datasetup-module/services/source-system.service';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-source-system-mapping',
  templateUrl: './source-system-mapping.component.html',
  styleUrls: ['./source-system-mapping.component.scss'],
})
export class SourceSystemMappingComponent implements OnInit {
  @Input() schedulerPage: any;
  @Input() payloadList: any;
  @Input() sourceSystemList: any;
  @Input() schedulerEditId: any;

  sourceSystemId: any;
  sourceSystemUuid: any;

  // Source System Store
  sourceSystemStoreList: any = [];

  // Source System Details
  sourceSystemDetails: any = {};
  config: any = {};
  connection: any = {};

  //Scheduler
  schedulerList: any = [];
  schedulersDetails: any = {

  };

  // CDP Object list for data mapping
  cdpDataModelList: any = [];
  cdpModuleList: any = [];

  // Switch view between object and attribute mapping screen
  viewType: string = "OBJECT_MAPPING"; //OBJECT_MAPPING / ATTRIBUTE_MAPPING

  // List of object which we are going to map (just added the object to view in the mapping screen)
  selectedSourceNameList: any = [];
  selectedTargetNameList: any = [];

  // Map to maintain the number of attribute mapped
  sourceAttrCountMap: any = {};
  targetAttrCountMap: any = {};
  sourceAuditAttrMap: any = {};

  // List of object which we need to show in source, target and mapping line
  sourceList: any = [];
  targetList: any = [];
  mappingLines: any = [];

  // Default size of the circle in the source and target object
  sourceCircle: any = { width: 8, height: 8 }; //Width and height of the circle in the start of the line
  targetCircle: any = { width: 8, height: 8 }; //Width and height of the circle in the end of the line

  //Selected line details and new line while we mapping
  selectedLine: any = null;
  newLine: any = null;
  newSourceDom: any = null;

  // Dimension of svg line mapping container
  outerContainer: any = {};

  //Soruce and target object and attribute map, it wil use for highlighting the mapped object and attribute
  sourceMappingRef: any = {};
  targetMappingRef: any = {};

  openModelName: string = "NONE"; // NONE/SOURCE/TARGET

  showDeleteButton: any = false;

  searchText: string = '';
  searchModule: string = '';

  mouseHoverAttrDetails: any = {};
  showloader: any = false;
  hideCdpModulesList: any[] = [];
  breadcrumb: any = {};

  exitConformation: string = 'CLOSE'; // exit conformation model veriable
  isInitTriggered: boolean = false;

  popoverDetails: any = {
    present: false,
    content: [],
  };

  isAuditConfigModal = false;

  editAttributeDetails: any = {};
  possibleCondition = ["MERGE_WITH_COMMA", "MERGE_WITH_SPACE", "MERGE_WITH_HYPEN", "SCRIPT"];

  auditFieldConfig: any = {};

  //scheduler

  //  use this

  idCounter: number = 0;

  schedulerTable: any = {
    name: "schedulertable",
    pk: "id",
    search: "",
    pageSize: 8,
    needServerSidePagination: true,
    fields: [
      { name: "Schedule name", attr: "name", width: "115", filterType: 'TEXT' },
      {
        name: "Occurance", attr: "occurrenceChip", width: "90", type: 'chip', filterType: 'ENUMS',
        filterEnums: [
          { value: "ONE_TIME_SCHEDULE", name: "One-Time" },
          { value: "RECURRING_SCHEDULE", name: "Recurring-Schedule" },
        ]
      },
      { name: "Schedule At", attr: "scheduledAt", width: "145" ,  type: "DATE", format: this.commonService.date_time_format, filterType: 'DATETIME' },
      {
        name: "Schedule Type", attr: "scheduleType", width: "100", type: 'chip', filterType: 'ENUMS',
        filterEnums: [
          { value: "CRON-BASED", name: "Cron-Based" },
          { value: "RATE-BASED", name: "Rate-Based" },
        ]
      },
      { name: "Cron/Rate Expression ", attr: "cronOrRateBased", width: "135", },
      { name: "StartDate", attr: "startDate", type: "DATE", format: this.commonService.date_format, width: "115", filterType: 'TEXT' },
      { name: "EndDate", attr: "endDate", type: "DATE", format: this.commonService.date_format, width: "115", filterType: 'DATETIME' },
      {
        name: "Status", attr: "status", width: "100", filterType: 'ENUMS',
        filterEnums: [
          { value: "SCHEDULED", name: "Activate" },
          { value: "DISABLED", name: "Deactivate" },
        ]
      },
    ],
    actions: [
      { name: "Edit", clickFunction: (el: any) => this.openSchdulerModel('SCHEDULER', el) },
      {
        name: "Deactivate",
        clickFunction: (el: any) => this.schedularStatusChange(el),
        isVisible: (el: any) => el.status == "SCHEDULED",
      },
      {
        name: "Activate",
        clickFunction: (el: any) => this.schedularStatusChange(el),
        isVisible: (el: any) => el.status == "DISABLED"
      },
      { name: "Delete", clickFunction: (el: any) => this.confirmDelete(el) },
    ],
    getRecord: (params: any) => this.getSchedulerData(params),
    buildData: (schedulerList: any) => {
      return schedulerList.map((scheduleDetails: any) => {
        if (!this.sourceSystemId) scheduleDetails.id = this.generateId();
        if (scheduleDetails.occurrence != 'ONE_TIME_SCHEDULE') {
          scheduleDetails.cronOrRateBased = scheduleDetails.scheduleType === "RATE-BASED" ? scheduleDetails.rateBasedExpression : scheduleDetails.cronExpression;
        }
        scheduleDetails.scheduledAt = this.datePipe.transform(scheduleDetails.scheduledAt, this.commonService.date_time_format);
        scheduleDetails.startDate = this.datePipe.transform(scheduleDetails.startDate, this.commonService.date_format);
        scheduleDetails.endDate = this.datePipe.transform(scheduleDetails.endDate, this.commonService.date_format);
        scheduleDetails.occurrence = scheduleDetails.occurrence;
        scheduleDetails.occurrenceChip = (scheduleDetails.occurrence == ('ONE_TIME_SCHEDULE' || 'One-Time')) ? 'One-Time' : 'Recurring';
        return scheduleDetails;
      });
    }
  };

  mappedSourceObjectList: any = [];

  selectedRef: any = {};

  sourceSystemProgressBar = [
    { id: 1, title: 'Source System', type: "SOURCE_SYSTEM", success: '../../assets/progress_icon/succcesstick.png', non_active: '../../assets/progress_icon/Indicator.png' },
    { id: 2, title: 'Connection', type: "CONNECTIONS", success: '../../assets/progress_icon/succcesstick.png', non_active: '../../assets/progress_icon/Indicator.png' },
    { id: 3, title: 'Object Mapping', type: "OBJECT_MAPPING", success: '../../assets/progress_icon/succcesstick.png', non_active: '../../assets/progress_icon/Indicator.png' },
    { id: 4, title: 'Scheduler', type: "SCHEDULER", success: '../../assets/progress_icon/succcesstick.png', non_active: '../../assets/progress_icon/Indicator.png' }
  ];

  csvSourceSystemProgressBar = [
    { id: 1, title: 'Source System', type: "SOURCE_SYSTEM", success: '../../assets/progress_icon/succcesstick.png', non_active: '../../assets/progress_icon/Indicator.png' },
    { id: 2, title: 'Object Mapping', type: "OBJECT_MAPPING", success: '../../assets/progress_icon/succcesstick.png', non_active: '../../assets/progress_icon/Indicator.png' },
  ];

  schedularProgressBar = [
    { id: 1, title: 'Basic details ', success: '../../assets/progress_icon/succcesstick.png', non_active: '../../assets/progress_icon/Indicator.png' },
    { id: 2, title: 'Payload ', success: '../../assets/progress_icon/succcesstick.png', non_active: '../../assets/progress_icon/Indicator.png' },
    { id: 3, title: 'Occurance', success: '../../assets/progress_icon/succcesstick.png', non_active: '../../assets/progress_icon/Indicator.png' },
  ];


  cronInputs = [
    { label: 'Minutes', value: '' },
    { label: 'Hours', value: '' },
    { label: 'Day of month', value: '' },
    { label: 'Month', value: '' },
    { label: 'Day of the week', value: '' },
    { label: 'Year', value: '' }
  ];
  @ViewChild('fileInputCsv') fileInputCsv: ElementRef | any;
  @ViewChild('stepPopover') stepPopover: any;
  @ViewChild('editpopover') editPopover: any;
  @ViewChild('scheduler_Table') scheduler_Table: TableComponent | undefined;
  @ViewChild('progressWizard', { static: false }) progressWizard!: ProgressBarComponentComponent;
  @ViewChild('progressBar', { static: false }) progressBar!: ProgressBarComponentComponent;
  @ViewChild('popover') popover: any;
  @ViewChild('schedularComponentCreate') schedularComponentCreate!: TemplateRef<any>;
  @ViewChild('outerContainerScrollRef', { read: ElementRef }) public outerContainerScrollRef!: ElementRef<any>;

  minDate = new Date();
  searchTerm: string = '';
  filteredProgressBar: any;
  csvUpload: any = {};
  constructor(private sourceSystemService: SourceSystemService, private schedulerService: SchedulerService,
    private router: Router, private route: ActivatedRoute, public commonService: CommonService,
    private alertController: AlertController, private datePipe: DatePipe) {
    this.filteredProgressBar = this.sourceSystemProgressBar;
  }


  ngOnInit() {
    this.init();
    this.sourceSystemUuid = this.route.snapshot.params['source_system_uuid'];
    this.resetPreDefineValue();
    // this.updateNames();
    if (this.schedulerEditId) {
      this.getSchedulerDetailsById()
    }
  }

  resetPreDefineValue() {
    this.schedulersDetails.scheduleType = this.schedulersDetails.scheduleType || 'CRON-BASED';
    this.schedulersDetails.occurrence = this.schedulersDetails.occurrence || 'ONE_TIME_SCHEDULE';
    this.schedulersDetails.timeZone = this.schedulersDetails.timeZone || 'IST';
  }

  ionViewWillLeave() {
    this.isInitTriggered = false;
    this.commonService.closeAllAlertCtrl();
  }
  ionViewWillEnter() {
    this.init();
    this.commonService.hideLoader();
  }

  async init() {
    this.resetAll();
    this.scheduler_Table?.init();
    await Promise.all([
      this.getAllSourceSystemStore(),
      this.getSourceSystemById(),
      this.getAllCdpObjects(),
    ]);
    if (this.isInitTriggered) return;
    this.isInitTriggered = true;
  }

  resetAll() {
    this.sourceSystemId = null;
    this.sourceSystemStoreList = [];
    this.sourceSystemDetails = {};
    this.config = {};
    this.connection = {};
    this.schedulerList = [];
    this.schedulersDetails = {};
    this.cdpDataModelList = [];
    this.cdpModuleList = [];
    this.viewType = "OBJECT_MAPPING";
    this.selectedSourceNameList = [];
    this.selectedTargetNameList = [];
    this.sourceAttrCountMap = {};
    this.targetAttrCountMap = {};
    this.sourceAuditAttrMap = {};
    this.sourceList = [];
    this.targetList = [];
    this.mappingLines = [];
    this.selectedLine = null;
    this.newLine = null;
    this.newSourceDom = null;
    this.outerContainer = {};
    this.sourceMappingRef = {};
    this.targetMappingRef = {};
    this.openModelName = "NONE";
    this.showDeleteButton = false;
    this.mouseHoverAttrDetails = {};
    this.showloader = false;
    this.hideCdpModulesList = [];
    this.breadcrumb = {};
    this.progressWizard?.checkGoBack(1);
  }

  async getSchedulerDetailsById() {
    this.commonService.showLoader();
    this.schedulerService.getSchedulerDetailsById(this.schedulerEditId).subscribe({
      next: (result: any) => {
        this.schedulersDetails = result;
        this.sourceSystemDetails = result.sourceSystem;
        this.sourceSystemId = this.sourceSystemDetails.id;
      },
      error: (err: any) => {
        err = err.error || err;
      }
    });
    this.commonService.hideLoader();
  }
  async getAllSourceSystemStore() {
    this.sourceSystemStoreList = null;
    this.sourceSystemStoreList = await this.sourceSystemService.getAllSourceSystemStore().toPromise();
  }

  async getAllCdpObjects() {
    this.cdpDataModelList = await this.sourceSystemService.getAllCdpObject().toPromise();
    this.cdpModuleList = [];
    this.cdpDataModelList.forEach((obj: any) => {
      if (this.cdpModuleList.indexOf(obj.module) == -1) this.cdpModuleList.push(obj.module);
    });
  }
  getSourceSystemDetails(id: any) {
    const sourceSystems = this.sourceSystemStoreList.find((item: any) => item.id === id);
    if (sourceSystems.category == 'IMPORT') {
      this.filteredProgressBar = this.csvSourceSystemProgressBar;
    } else {
      this.filteredProgressBar = this.sourceSystemProgressBar;
    }
    this.sourceSystemDetails.category = sourceSystems.category;
    this.sourceSystemDetails.subCategory = sourceSystems.subCategory;
  }

  async getSourceSystemById() {
    this.commonService.showLoader();
    if (this.sourceSystemUuid) {
      this.sourceSystemDetails = await this.sourceSystemService.getAllConnectorsDetailsWithUuid(this.sourceSystemUuid).toPromise();
      this.sourceSystemId = this.sourceSystemDetails.id;
      if (this.sourceSystemDetails.category == 'IMPORT') {
        this.filteredProgressBar = this.csvSourceSystemProgressBar;
      } else {
        this.filteredProgressBar = this.sourceSystemProgressBar;
      }
      // this.schedulerList = //TOOD: integrate get all scheduler list by external source system
      const { sourceSystemObjects, objectMapping } = this.sourceSystemDetails.configuration;
      if (sourceSystemObjects && objectMapping) {
        const sourceNameList = objectMapping.map((obj: any) => obj.sourceName);
        sourceSystemObjects.forEach((obj: any) => {
          if (sourceNameList.includes(obj.name)) obj.selected = true;
        });
      }
      this.scheduler_Table?.init();
    } else {
      this.sourceSystemDetails = {
        name: "",
        description: "",
        category: "",
        subCategory: "",
        sourceSystemStoreId: "",
        imgBase64: "",
        connection: {},
        configuration: { objectMapping: [], sourceSystemObjects: [], csvSeperator: ',' },
      }
      this.sourceSystemDetails = {
        name: "",
        description: "",
        category: "DATABASE",
        subCategory: "MYSQL",
        sourceSystemStoreId: 1,
        imgBase64: "",
        connection: {
          "host": "cdp-db-proxy.proxy-cf7siuqnpusg.us-east-1.rds.amazonaws.com",
          "port": 3306,
          "user": "admin",
          "password": "Web3$123",
          "schema": "dotmobile"
        },
        configuration: { objectMapping: [], sourceSystemObjects: [], csvSeperator: ',' }
      }
    }
    this.config = this.sourceSystemDetails.configuration;
    this.connection = this.sourceSystemDetails.connection;
    this.commonService.hideLoader();
  }

  uploadSwaggerFile(event: any): void {
    if (!this.config.sourceSystemObjects.length || !this.selectedSourceNameList.length || !this.config?.sourceSystemObjects.length) return
    this.showloader = !this.showloader;
    const files: FileList = event.target.files;
    if (files.length > 0) {
      const selectedFile: File = files[0];
      if (selectedFile.type === 'application/json') {
        const fileReader: FileReader = new FileReader();
        fileReader.onload = async (e) => {
          if (this.sourceSystemDetails.category == 'APPLICATION' && this.sourceSystemDetails.subCategory == 'REST') this.config.sourceSystemObjects = (await this.sourceSystemService.uploadSwaggerFile(JSON.parse(fileReader.result as string)).toPromise() as any).models;
        };
        fileReader.readAsText(selectedFile);
      } else {
        console.error('Please select a valid JSON file.');
      }
    }
  }
  async fetchTableDatas() {
    try {
      await this.commonService.showLoader();
      const data = {
        category: this.sourceSystemDetails.category,
        subCategory: this.sourceSystemDetails.subCategory,
        connection: this.sourceSystemDetails.connection
      };
      this.config.sourceSystemObjects = await this.sourceSystemService.getDataModel(data).toPromise();
    } catch (err: any) {
      this.commonService.toster.error(err.message || err);
    } finally {
      this.commonService.hideLoader();
    }
  }

  async uploadCsv(type: any) {
    try {
      await this.commonService.showLoader();
      if (type == 'UPLOAD') {
        if (!this.csvUpload.objectName) throw { message: "Please Enter Object Name" };
        if (!this.csvUpload.fileName) throw { message: "Please Upload File" };
        this.addSourceSystemObjectFromCsv(this.csvUpload.objectName, this.csvUpload.file)
        this.openModelName = 'SOURCE';
      } else if (type == 'IMPORT') {
        this.csvUpload = {};
        this.openModelName = 'CSV-MODAL';
      }
    } catch (err: any) {
      this.commonService.toster.error(err.message || err);
    } finally {
      this.commonService.hideLoader();
    }

  }

  async csvFileReader(event: any) {
    await this.commonService.showLoader();
    const file = event.target.files[0];
    this.csvUpload.fileName = file.name;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const fileContent = e.target.result as string;
        const lines = fileContent.trim().split('\n');
        const headerLine = lines[0];
        this.csvUpload.file = headerLine.split(this.sourceSystemDetails.configuration.csvSeperator);
        this.commonService.hideLoader();

      };
      reader.readAsText(file);
    }
  }
  clearFileSelection() {
    this.csvUpload.fileName = '';
    const fileInput = this.fileInputCsv.nativeElement;
    fileInput.value = '';
  }

  modelCancel() {
    this.openModelName = 'SOURCE';
    this.csvUpload = {}
  }
  async addSourceSystemObjectFromCsv(name: string, attributes: any) {
    var objectDetails = this.config.sourceSystemObjects.find((obj: any) => obj.name == name);
    if (!objectDetails) {
      objectDetails = { name, attributes: [] };
      this.config.sourceSystemObjects.push(objectDetails);
    }
    objectDetails.attributes = attributes.map((name: string) => ({ name, type: "STRING" }));
  }

  openModel(type: string, obj?: any, mappingList?: any) {
    this.openModelName = type;
    this.searchText = '';
    this.searchModule = '';
    this.hideCdpModulesList = [];
    if (type == 'TARGET') {
      this.cdpDataModelList.forEach((obj: any) => {
        if ((this.targetAttrCountMap[obj.name] || []).length > 0) obj.selected = true;
        if (!this.hideCdpModulesList.includes(obj.module)) this.hideCdpModulesList.push(obj.module);
      });

    } else if (type == 'ENUM' || type == 'MULTIPLE') {
      const mappingDetails = mappingList[0];
      const mappingAttr: any = this.config.objectMapping
        .find((mapping: any) => mapping.sourceName == mappingDetails.sourceName)
        .targets.find((target: any) => target.name == mappingDetails.targetName)
        .attributes[mappingDetails.targetAttr];
      if (type == 'ENUM') {
        const sourceEnumAttr = this.config.sourceSystemObjects
          .find((obj: any) => obj.name == mappingDetails.sourceName)
          .attributes.find((attr: any) => attr.name == mappingDetails.sourceAttr);
        this.editAttributeDetails = {
          type,
          sourceName: mappingDetails.sourceName,
          sourceAttr: mappingDetails.sourceAttr,
          targetName: mappingDetails.targetName,
          targetAttr: mappingDetails.targetAttr,
          sourceEnumList: sourceEnumAttr.type == 'ENUM' ? sourceEnumAttr.values || [] : [],
          targetEnumList: obj.values || [],
          mappingList: []
        }
        Object.entries(mappingAttr.values).forEach(([targetEnum, sourceEnum]: any) => {
          this.editAttributeDetails.mappingList.push({ sourceEnum, targetEnum });
        });
        if (this.editAttributeDetails.mappingList.length == 0) {
          this.addRow();
        }
      } else if (type == 'MULTIPLE') {
        this.editAttributeDetails = {
          type,
          sourceName: mappingList[0].sourceName,
          sourceAttr: mappingList[0].sourceAttr,
          targetName: mappingList[0].targetName,
          targetAttr: mappingList[0].targetAttr,
          attrMergeCond: mappingAttr.condition,
          attrMergeScript: mappingAttr.script
        }
      }
    }
  }

  updateAttributeMapping() {
    try {
      const mappingAttr = this.config.objectMapping
        .find((mapping: any) => mapping.sourceName == this.editAttributeDetails.sourceName)
        .targets.find((target: any) => target.name == this.editAttributeDetails.targetName)
        .attributes[this.editAttributeDetails.targetAttr];
      const updatedEnumMap: any = {};
      const uniqueEnumList: any = [];
      if (this.editAttributeDetails.type == 'ENUM') {
        this.editAttributeDetails.mappingList.forEach((mapping: any) => {
          if (!mapping.sourceEnum) throw "Source Enum is Mandatory";
          if (!mapping.targetEnum) throw "Target Enum is Mandatory";
          if (uniqueEnumList.includes(mapping.sourceEnum)) throw "Source Enum Mapping should be Unique";
          uniqueEnumList.push(mapping.sourceEnum);
          updatedEnumMap[mapping.targetEnum] = mapping.sourceEnum;
        });
        mappingAttr.values = updatedEnumMap;
      } else if (this.editAttributeDetails.type == 'MULTIPLE') {
        //tODO have sttrmergescript as mandatory based on condition
        mappingAttr.condition = this.editAttributeDetails.attrMergeCond;
        mappingAttr.script = mappingAttr.condition == 'SCRIPT' ? this.editAttributeDetails.attrMergeScript : '';
      }
      this.closeModel();

    } catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
      return;
    }
  }

  /* START:: Update Audit Field while Mapping */
  openEditAuditAttribute(sourceName: string) {
    const sourceMappingDetails = this.config.objectMapping.find((mapping: any) => mapping.sourceName == sourceName);
    const dateAttributeList = ((this.config.sourceSystemObjects.find((obj: any) => obj.name == sourceName) || {}).attributes || [])
      .filter((obj: any) => ['DATETIME'].includes(obj.type));
    delete this.auditFieldConfig.errorMessage;
    if (dateAttributeList.length == 0) {
      this.auditFieldConfig.errorMessage = `Source object ${sourceName} doesn't have any audit field (Date field).`;
    } else {
      this.auditFieldConfig.sourceName = sourceName;
      this.auditFieldConfig.dateAttributeList = dateAttributeList;
      this.auditFieldConfig.previousUpdatedAtAttribute = this.auditFieldConfig.updatedAtAttribute = sourceMappingDetails.updatedAtAttribute || '';
      this.isAuditConfigModal = true;
    }
  }

  saveAuditAttribute() {
    try {
      if (!this.auditFieldConfig.updatedAtAttribute) throw "Please select Audit Field";
      const sourceMappingDetails = this.config.objectMapping.find((mapping: any) => mapping.sourceName == this.auditFieldConfig.sourceName);

      this.sourceAuditAttrMap[this.auditFieldConfig.sourceName] = sourceMappingDetails.updatedAtAttribute = this.auditFieldConfig.updatedAtAttribute;
      this.isAuditConfigModal = false;
    } catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    }
  }

  cancelEditAuditAttribute(sourceName: string) {
    if (!this.auditFieldConfig.previousUpdatedAtAttribute) {
      this.config.objectMapping = this.config.objectMapping.filter((mapping: any) => mapping.sourceName != sourceName);
      this.mappingLines = this.mappingLines.filter((obj: any) => obj.sourceName != sourceName);
      this.updateMappingRef();
    }

    this.isAuditConfigModal = false;
  }

  addRow() {
    this.editAttributeDetails.mappingList.push({ sourceEnum: '', targetEnum: '' });
  }

  deleteRow(index: number) {
    this.editAttributeDetails.mappingList.splice(index, 1);
  }

  closeModel() {
    this.openModelName = 'NONE';
  }

  addObjectForMapping(type: string) {
    if (type === "SOURCE") {
      this.selectedSourceNameList = this.config.sourceSystemObjects
        .filter((object: any) => object.selected)
        .map((object: any) => object.name);
    } else if (type === "TARGET") {
      this.selectedTargetNameList = this.cdpDataModelList
        .filter((object: any) => object.selected)
        .map((object: any) => object.name);
    }
    this.loadObjects();
    this.closeModel();
  }

  switchToObjectView() {
    this.viewType = "OBJECT_MAPPING";
    this.loadObjects();
  }

  switchToAttributeView(type: string, name: string) {
    this.viewType = 'ATTRIBUTE_MAPPING';
    this.loadObjects(type, name);
    this.breadcrumb.name = name;
    if (type == 'SOURCE') this.breadcrumb.type = 'Source System Object';
    if (type == 'TARGET') this.breadcrumb.type = 'CDP Object';
  }

  updateMappingRef() {
    if (this.viewType == "OBJECT_MAPPING") {
      this.sourceAttrCountMap = {};
      this.targetAttrCountMap = {};
      this.sourceAuditAttrMap = {};
      if (this.config.objectMapping.length > 0) {
        this.config.objectMapping.forEach((mapping: any) => {
          if (this.selectedSourceNameList.indexOf(mapping.sourceName) == -1) {
            this.selectedSourceNameList.push(mapping.sourceName);
          }
          this.sourceAuditAttrMap[mapping.sourceName] = mapping.updatedAtAttribute || '';
          const sourceAttrCountMapRef = this.sourceAttrCountMap[mapping.sourceName] = this.sourceAttrCountMap[mapping.sourceName] || [];
          mapping.targets.forEach((target: any) => {
            if (this.selectedTargetNameList.indexOf(target.name) == -1) this.selectedTargetNameList.push(target.name);
            const targetAttrCountMapRef = this.targetAttrCountMap[target.name] = this.targetAttrCountMap[target.name] || [];
            Object.entries(target.attributes).forEach(([targetAttr, sourceAttr]: any) => {
              if (!targetAttrCountMapRef.includes(targetAttr)) targetAttrCountMapRef.push(targetAttr);
              if (typeof (sourceAttr) == "object") {
                if (sourceAttr.attrList) {
                  sourceAttr.attrList.forEach((attr: any) => {
                    if (!sourceAttrCountMapRef.includes(attr)) sourceAttrCountMapRef.push(attr);
                  });
                } else if (sourceAttr.attr && !sourceAttrCountMapRef.includes(sourceAttr.attr)) sourceAttrCountMapRef.push(sourceAttr.attr);
              } else if (!sourceAttrCountMapRef.includes(sourceAttr)) sourceAttrCountMapRef.push(sourceAttr);
            });
          });
        });
      }
    }

    this.targetMappingRef = {};
    this.sourceMappingRef = {};
    this.mappingLines.forEach((line: any) => {
      this.sourceMappingRef[line.sourceName] = this.sourceMappingRef[line.sourceName] || {};
      if (line.sourceAttr) this.sourceMappingRef[line.sourceName][line.sourceAttr] = true;
      this.targetMappingRef[line.targetName] = this.targetMappingRef[line.targetName] || {};
      if (line.targetAttr) {
        this.targetMappingRef[line.targetName][line.targetAttr] = this.targetMappingRef[line.targetName][line.targetAttr] || [];
        this.targetMappingRef[line.targetName][line.targetAttr].push(line);
      }
    });
  }

  //code for mapping
  loadObjects(type?: string, objectName?: string) {
    if (this.viewType == "OBJECT_MAPPING") {
      this.updateMappingRef();
      this.sourceList = this.createDataList(this.config.sourceSystemObjects.filter((source: any) => this.selectedSourceNameList.indexOf(source.name) != -1), 'SOURCE');
      this.targetList = this.createDataList(this.cdpDataModelList.filter((target: any) => this.selectedTargetNameList.indexOf(target.name) != -1), 'TARGET');
    } else {
      const sourceObjNameList: any = [];
      const targetObjNameList: any = [];
      if (type == "SOURCE") {
        sourceObjNameList.push(objectName);
        const { targets } = this.config.objectMapping.find((mapping: any) => mapping.sourceName == objectName) || {};
        targets.forEach((obj: any) => targetObjNameList.push(obj.name));
      } else if (type == "TARGET") {
        targetObjNameList.push(objectName);
        this.config.objectMapping.forEach((mapping: any) => {
          mapping.targets.forEach((target: any) => {
            if (target.name == objectName) sourceObjNameList.push(mapping.sourceName);
          });
        });
      }
      this.sourceList = this.createDataList(this.config.sourceSystemObjects.filter((obj: any) => sourceObjNameList.indexOf(obj.name) != -1), 'SOURCE', true);
      this.targetList = this.createDataList(this.cdpDataModelList.filter((obj: any) => targetObjNameList.indexOf(obj.name) != -1), 'TARGET', true);
    }
    setTimeout(() => { this.dataMapping() }, 0);
  }

  toggleObject(event: any, obj: any, objList: any) {
    const isExpand = obj.isExpand;
    objList.forEach((obj: any) => obj.isExpand = false);
    obj.isExpand = !isExpand;
    event.stopPropagation();
    setTimeout(() => { this.dataMapping() }, 0);

  }

  buildRef(ref: string, name: string, attrName?: string) {
    name = name.replace(/[^a-zA-Z0-9]/g, '');
    attrName = (attrName || '').replace(/[^a-zA-Z0-9]/g, '');
    return attrName ? `${ref}-${name}-${attrName}` : `${ref}-${name}`
  }

  createDataList(dataModelList: any, ref: string, autoOpenFirstObject: boolean = false) {
    return dataModelList.map((obj: any, index: number) => ({
      id: this.buildRef(ref, obj.name),
      name: obj.name,
      isExpand: (autoOpenFirstObject && dataModelList.length == 1),
      attributes: (obj.attributes || []).map((attr: any) => ({
        id: this.buildRef(ref, obj.name, attr.name),
        name: attr.name,
        type: attr.type,
        values: attr.values,
      }))
    }));
  }

  updateMidPoint(obj: any, iconPosition: any) {
    const dom = this.outerContainerScrollRef?.nativeElement;
    const scrollLeft = dom ? dom.scrollLeft : 0;
    const scrollTop = dom ? dom.scrollTop : 0;
    obj.midX = (obj.left + obj.width / 2) - this.outerContainer.left + scrollLeft;
    obj.midY = (obj.top + obj.height / 2) - this.outerContainer.top + scrollTop;
    obj.iconPosition = {
      x: obj.midX - iconPosition.width / 2,
      y: obj.midY - iconPosition.height / 2
    };
    return obj;
  }

  getLinePosition(start: any, end: any) {
    const { midX: startX, midY: startY } = start;
    const { midX: endX, midY: endY } = end;
    const positionX = startX + (endX - startX) / 3;
    const positionY = startX + (endX - startX) / 3 * 2;
    return `M${startX} ${startY} C${positionX} ${startY}, ${positionY} ${endY} ${endX} ${endY}`;
  }

  buildLineObject(sourceName: string, sourceAttr: any, targetName: string, targetAttr: any) {
    const sourceElement: any = document.getElementById(this.buildRef('SOURCE', sourceName, sourceAttr)) || document.getElementById(this.buildRef('SOURCE', sourceName));
    const targetElement: any = document.getElementById(this.buildRef('TARGET', targetName, targetAttr)) || document.getElementById(this.buildRef('TARGET', targetName));

    if (sourceElement && targetElement) {
      const sourcePositionRef: any = this.updateMidPoint(sourceElement.getBoundingClientRect(), this.sourceCircle);
      const targetPositionRef: any = this.updateMidPoint(targetElement.getBoundingClientRect(), this.targetCircle);
      this.mappingLines.push({
        sourceName, sourceAttr, targetName, targetAttr,
        path: this.getLinePosition(sourcePositionRef, targetPositionRef),
        rectangle: sourcePositionRef.iconPosition,
        arrowPath: targetPositionRef.iconPosition
      });
      this.updateMappingRef();
    }
  }

  startDragging(event: any, sourceObj: any, sourceAttrDetails: any) {
    this.newSourceDom = event.target;
    this.newSourceDom.sourceName = sourceObj.name;
    this.newSourceDom.sourceAttr = sourceAttrDetails;
    if (this.selectedLine) this.deSelectLine();
    this.outerContainer = this.outerContainerScrollRef?.nativeElement?.getBoundingClientRect();
  }

  buildNewLineWhileDragging(event: PointerEvent) {
    if (this.newSourceDom) {
      const sourcePositionRef: any = this.updateMidPoint(this.newSourceDom.getBoundingClientRect(), this.sourceCircle);
      const targetPositionRef: any = this.updateMidPoint({ left: event.clientX, top: event.clientY, width: 0, height: 0 }, this.targetCircle);
      this.newLine = {
        path: this.getLinePosition(sourcePositionRef, targetPositionRef),
        rectangle: sourcePositionRef.iconPosition,
        arrowPath: targetPositionRef.iconPosition
      };
    }
  }

  stopDragging(targetObj?: any, targetAttrDetails?: any) {
    if (this.newSourceDom) {
      if (targetObj) {
        var skipMapping = false;
        const { sourceName, sourceAttr } = this.newSourceDom;
        const targetName = targetObj.name;
        const targetAttr = targetAttrDetails;
        var sourceMappingDetails = this.config.objectMapping.find((mapping: any) => mapping.sourceName == sourceName);
        if (!sourceMappingDetails) {
          sourceMappingDetails = { sourceName, targets: [] };
          this.config.objectMapping.push(sourceMappingDetails);
        }
        var targetMappingDetails = sourceMappingDetails.targets.find((target: any) => target.name == targetName);
        if (!targetMappingDetails) {
          targetMappingDetails = { name: targetName, attributes: {} };
          sourceMappingDetails.targets.push(targetMappingDetails);
          if (!sourceMappingDetails.updatedAtAttribute) {
            this.openEditAuditAttribute(sourceName);
          }
        } else if (this.viewType == 'OBJECT_MAPPING') {
          skipMapping = true;
        }
        if (targetAttr) {
          const mappingRef = this.targetMappingRef[targetName]?.[targetAttr.name] || [];
          var attrMappingDetails = targetMappingDetails.attributes[targetAttr.name];

          if (mappingRef.length > 0 && mappingRef.find((obj: any) => obj.sourceName == sourceName) == null) {
            skipMapping = true;
          } else if (attrMappingDetails) {
            if (targetAttr.type != "ENUM") {
              if (typeof (attrMappingDetails) == "string" && attrMappingDetails != sourceAttr.name) {
                targetMappingDetails.attributes[targetAttr.name] = {
                  attrList: [attrMappingDetails, sourceAttr.name]
                }
              } else if (attrMappingDetails.attrList && attrMappingDetails.attrList.indexOf(sourceAttr.name) == -1) {
                attrMappingDetails.attrList.push(sourceAttr.name);
              } else skipMapping = true;
            } else skipMapping = true;
          } else {
            if (targetAttr.type == "ENUM") {
              targetMappingDetails.attributes[targetAttr.name] = {
                attr: sourceAttr.name,
                type: 'ENUM',
                condition: 'MERGE_WITH_SPACE',
                values: {}
              };
            } else {
              targetMappingDetails.attributes[targetAttr.name] = sourceAttr.name;
            }
          }
        }
        if (!skipMapping) this.buildLineObject(sourceName, sourceAttr?.name, targetName, targetAttr?.name);

      }
      this.newSourceDom = null;
      this.newLine = null;
    }
    if (this.selectedLine) this.deSelectLine();
  }


  dataMapping() {
    this.outerContainer = this.outerContainerScrollRef?.nativeElement?.getBoundingClientRect();
    this.mappingLines = [];
    (this.config.objectMapping || []).forEach((mapping: any) => {
      const { sourceName, targets } = mapping;
      targets.forEach((target: any) => {
        const { name: targetName, attributes } = target;
        if (this.viewType == "OBJECT_MAPPING") {
          this.buildLineObject(sourceName, null, targetName, null);
        } else {
          Object.entries(attributes).forEach(([targetAttr, sourceAttr]: any) => {
            if (typeof (sourceAttr) == "string") {
              this.buildLineObject(sourceName, sourceAttr, targetName, targetAttr);
            } else if (typeof (sourceAttr) == "object") {
              if (sourceAttr.attr) {
                this.buildLineObject(sourceName, sourceAttr.attr, targetName, targetAttr);
              } else if (sourceAttr.attrList) {
                sourceAttr.attrList.forEach((attr: string) => {
                  this.buildLineObject(sourceName, attr, targetName, targetAttr);
                });
              } else console.log("INVALID");
            } else console.log("INVALID");
          });
        }
      });
    });
    if (this.selectedLine) this.deSelectLine();
  }

  selectLine(lineDetails: any, index: number) {
    if (this.newLine) return
    if (this.selectedLine) this.selectedLine.isSelected = false;
    const { sourceName, sourceAttr, targetName, targetAttr } = lineDetails;
    const sourceElement: any = document.getElementById(this.buildRef('SOURCE', sourceName, sourceAttr));
    const targetElement: any = document.getElementById(this.buildRef('TARGET', targetName, targetAttr));
    if (sourceElement || targetElement) {
      this.selectedLine = lineDetails;
      this.selectedLine.index = index;
      this.selectedLine.isSelected = true;
    }
  }

  deSelectLine() {
    this.selectedLine.isSelected = false;
    this.selectedLine = null;
  }

  deleteLine() {
    this.config.objectMapping.find((mapping: any, mappingIndex: number) => {
      if (this.selectedLine.sourceName == mapping.sourceName) {
        mapping.targets.find((target: any, targetIndex: number) => {
          if (this.selectedLine.targetName == target.name) {
            if (this.viewType == "OBJECT_MAPPING") {
              mapping.targets.splice(targetIndex, 1);
            } else {
              const { attributes } = target;
              const sourceAttr = attributes[this.selectedLine.targetAttr];
              if (typeof (sourceAttr) == "string" && sourceAttr == this.selectedLine.sourceAttr) {
                delete attributes[this.selectedLine.targetAttr];
              } else if (typeof (sourceAttr) == "object") {
                if (sourceAttr.attr && sourceAttr.attr == this.selectedLine.sourceAttr) {
                  delete attributes[this.selectedLine.targetAttr];
                } else if (sourceAttr.attrList) {
                  sourceAttr.attrList = sourceAttr.attrList.filter((attr: string) => attr != this.selectedLine.sourceAttr);
                  if (sourceAttr.attrList.length == 1) {
                    attributes[this.selectedLine.targetAttr] = sourceAttr.attrList[0];
                    //TODO: if we custom script then we need to convert as object
                  }
                }
              }
              // if (Object.keys(attributes).length == 0) mapping.targets.splice(targetIndex, 1);
            }
            return true;
          } else return false;
        });
        if (mapping.targets.length == 0) this.config.objectMapping.splice(mappingIndex, 1);
        return true;
      } else return false;
    });

    this.mappingLines.splice(this.selectedLine.index, 1);
    this.selectedLine = null;
    this.updateMappingRef();
  }

  resetFlow() {
    this.switchToObjectView();
    this.breadcrumb = {};
    this.stopDragging();
  }

  @HostListener('document:keyup', ['$event'])
  hanleDeleteKeyboaedEvent(event: KeyboardEvent) {
    if (this.selectedLine) {
      if (event.key === 'Delete') this.deleteLine();
      else if (event.key === 'Escape') this.deSelectLine();
    } else if (this.newLine) {
      if (event.key === 'Escape') this.stopDragging();
    }
  }

  validateProcess() {
    if (!this.sourceSystemDetails.category) throw { message: "Please select source system" };
    if (!this.sourceSystemDetails.name) throw { message: "Please enter name" };
    if (this.sourceSystemDetails.category == 'DATABASE' && (this.progressWizard.currentActive == 2)) {
      if (!this.connection.host) throw { message: "Please enter hostname" };
      if (!this.connection.port) throw { message: "Please enter port" };
      if (!this.connection.user) throw { message: "Please enter username" };
      if (!this.connection.password) throw { message: "Please enter password" };
      if (!this.connection.schema) throw { message: "Please enter schema" };
    }
  }

  async nextContainer() {
    const { type } = this.progressWizard.progressbarObj[this.progressWizard.currentActive] || {};
    const isLastWizard = !type;
    try {
      this.validateProcess();
      if (isLastWizard) {
        this.createSourceSystem();
      } else {
        this.progressWizard.next();
      }
    } catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    }
    if (this.sourceSystemId && type == "OBJECT_MAPPING") {
      this.loadObjects();
    }
    if (type == "OBJECT_MAPPING") {
      this.sourceSystemDetails.configuration.objectMapping.filter((obj: any) => obj.targets.filter((obj: any) => Object.keys(obj.attributes).length > 0).length > 0).map((obj: any) => obj.sourceName);
    } else if (type == "SCHEDULER" && this.viewType != 'OBJECT_MAPPING') {
      this.viewType = "OBJECT_MAPPING";
      this.resetFlow();
    } else if (isLastWizard) {
      this.resetFlow();
    }
    await this.sourceSystemService.getAllSourceSystemsIdAndName(false);
  }

  backContainer() {
    this.progressWizard.prev();
    this.viewType = "OBJECT_MAPPING";
    this.resetFlow();
  }

  async createSourceSystem() {
    const sourceSystemDetails = JSON.parse(JSON.stringify(this.sourceSystemDetails));
    sourceSystemDetails.configuration.objectMapping = sourceSystemDetails.configuration.objectMapping.filter((mapping: any) => {
      mapping.targets = mapping.targets.filter((attrValue: any) => Object.keys(attrValue.attributes).length > 0);
      return mapping.targets.length > 0;
    });
    (sourceSystemDetails.configuration.sourceSystemObjects || []).forEach((obj: any) => delete obj.selected);

    //create flow
    if (!this.sourceSystemUuid) {
      await this.commonService.showLoader();
      sourceSystemDetails.scheduleList = this.schedulerList;
      this.sourceSystemService.createSourceSystem(sourceSystemDetails).subscribe((
        {
          next: async (details: any) => {
            this.commonService.toster.success('Source system created succesfully');
            this.router.navigateByUrl('/data-setup/source-system');
            await this.commonService.hideLoader();
          },
          error: (err: any) => {
            this.commonService.hideLoader();
            this.commonService.toster.error(err.error.error.message);
            throw err;
          }
        }
      ));
    }

    //edit flow
    if (this.sourceSystemUuid) {
      try {
        await this.commonService.showLoader();
        const finalCheck = await this.sourceSystemService.updateConnectorsDetailsWithUuid(this.sourceSystemUuid, sourceSystemDetails).toPromise();
        this.commonService.toster.success('Source system updated succesfully');
        this.router.navigateByUrl('/data-setup/source-system');
        await this.commonService.hideLoader();
      } catch (e: any) {
        this.commonService.hideLoader();
        this.commonService.toster.error(e.error?.error?.message || e.message || e);
      } finally {
        await this.commonService.hideLoader();
      }
    }

  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.sourceSystemDetails.imgBase64 = base64String;
      };
      reader.readAsDataURL(file);
    }
  }

  deleteImage() {
    this.sourceSystemDetails.imgBase64 = '';
  }

  toggleExpandCollapse() {
    if (this.hideCdpModulesList.length) {
      this.hideCdpModulesList = [];
    } else {
      this.hideCdpModulesList = this.cdpDataModelList.map((object: any) => object.module);
    }
  }

  toggleModuleVisibility(module: string) {
    if (this.hideCdpModulesList.includes(module)) {
      this.hideCdpModulesList = this.hideCdpModulesList.filter(m => m !== module);
    } else {
      this.hideCdpModulesList.push(module);
    }
  }

  highlightName(type: string, objectName: any, attrName?: any) {
    this.mouseHoverAttrDetails = type == 'SOURCE' ? { sourceObjectName: objectName, sourceAttr: attrName } : { targetObjectName: objectName, targetAttr: attrName };
  }

  resetHighlight() {
    this.mouseHoverAttrDetails = {};
  }

  exitModel() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    });

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You're about to exit. Any unsaved changes will be lost.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, stay!',
      confirmButtonColor: "#5164b8",
      cancelButtonColor: "#d33",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/data-setup/source-system']);
      }
    });
  }
  openEnumPopover(e: any, attr: any) {
    this.popover.event = e;
    this.popoverDetails.content = attr.values;
    this.popoverDetails.present = true;
  }


  //schduler code

  openSchdulerModel(type: any, data?: any) {
    try {
      console.log(this.sourceAttrCountMap, 'js')
      this.mappedSourceObjectList = Object.entries(this.sourceAttrCountMap).map(([key, value]: any) => value.length > 0 ? key : false).filter(Boolean);
      if (!this.mappedSourceObjectList.length) {
        this.openModelName = 'ERROR';
        return;
      }
      if (data) {
        this.schedulersDetails = JSON.parse(JSON.stringify(data));
        this.schedulersDetails.scheduledAt = this.datePipe.transform(this.schedulersDetails.scheduledAt, 'YYYY-MM-ddTHH:mm:ss');
        this.schedulersDetails.startDate = this.datePipe.transform(this.schedulersDetails.startDate, 'YYYY-MM-ddTHH:mm:ss');
        this.schedulersDetails.endDate = this.datePipe.transform(this.schedulersDetails.endDate, 'YYYY-MM-ddTHH:mm:ss');
        if (this.schedulersDetails.occurrence != 'ONE_TIME_SCHEDULE') {
          if (this.schedulersDetails.scheduleType === "RATE-BASED") {
            const [rateBaseValue, rateBaseUnit] = this.schedulersDetails.rateBasedExpression.split(' ');
            this.schedulersDetails.rateBaseValue = rateBaseValue;
            this.schedulersDetails.rateBaseUnit = rateBaseUnit;
          } else if (this.schedulersDetails.scheduleType === "CRON-BASED") {
            this.schedulersDetails.cronExpression.split(' ').forEach((value: any, index: number) => {
              this.cronInputs[index].value = value;
            });
          }
        }
      } else {
        this.cronInputs = [
          { label: 'Minutes', value: '' },
          { label: 'Hours', value: '' },
          { label: 'Day of month', value: '' },
          { label: 'Month', value: '' },
          { label: 'Day of the week', value: '' },
          { label: 'Year', value: '' }
        ];
        this.schedulersDetails = {};
        this.schedulersDetails = {
          occurrence: 'ONE_TIME_SCHEDULE',
          scheduleType: 'CRON-BASED',
          timeZone: 'IST',
          payload: [
            { name: "Start", type: "START" },
            { name: "End", type: "END" }
          ]
        };
      }
      this.openModelName = type;
    } catch (e: any) {
      this.commonService.hideLoader();
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    } finally {
      this.commonService.hideLoader();
    }
    this.resetPreDefineValue();
  }

  async nextScheduler() {
    try {
      this.schedulerValidation();
      if (this.schedularProgressBar.length == this.progressBar.currentActive) {
        await this.commonService.showLoader();
        await this.saveSchedular();
      } else {
        this.progressBar.next();
      }
      if (this.schedulerPage) {
        this.resetPreDefineValue();
      }
    } catch (e: any) {
      this.commonService.hideLoader();
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    } finally {
      this.commonService.hideLoader();
    }
    this.loadObjects();
  }

  schedulerValidation() {
    if (this.schedulerPage && !this.schedulerEditId) {
      if (!this.sourceSystemDetails.name) throw { message: "Please Select Source System" };
    }
    if (this.schedulerPage && this.schedulerEditId) {
      if (!this.sourceSystemDetails.name) throw { message: "Please Select Source System" };
    }
    if (!this.schedulersDetails.name) throw { message: "Please Enter Scheduler name" };
    let nonEmptyFlowListCount = 0;
    if (this.progressBar.currentActive == 2) {
      if ((this.schedulersDetails.payload || this.payloadList).length >= 2) {
        (this.schedulersDetails.payload || this.payloadList).forEach((object: any) => {
          if (object.children && object.children.length > 0) {
            object.children.forEach((child: any) => {
              if (child.flowList && child.flowList.length > 0) {
                nonEmptyFlowListCount++;
              }
            });
            if (nonEmptyFlowListCount == 0) {
              throw { message: "Please atleast add one Objects" };
            }
          }
        });
      }
      if ((this.schedulersDetails.payload || this.payloadList).length <= 2 && nonEmptyFlowListCount == 0) throw { message: "Please atleast add one Objects" };
    }

  }

  previousScheduler() {
    this.progressBar.prev();
  }

  async saveSchedular() {
    try {
      this.schedulersDetails.timeZone = this.schedulersDetails.timeZone || 'IST';
      if (this.schedulersDetails.occurrence == 'ONE_TIME_SCHEDULE') {
        if (!this.schedulersDetails.scheduledAt) throw { message: "Please Enter Date and Time" };
      }
      if (this.schedulersDetails.occurrence == 'RECURRING_SCHEDULE') {
        if (!this.schedulersDetails.scheduleType) throw { message: "Please Enter Date and Time" };
        if (!this.schedulersDetails.startDate || !this.schedulersDetails.endDate) {
          throw { message: "Please provide start and end dates" };
        }
        const startDateUTC: Date = new Date(this.schedulersDetails.startDate);
        const endDateUTC: Date = new Date(this.schedulersDetails.endDate);
        startDateUTC.setMinutes(startDateUTC.getMinutes() + startDateUTC.getTimezoneOffset());
        endDateUTC.setMinutes(endDateUTC.getMinutes() + endDateUTC.getTimezoneOffset());
        if (startDateUTC >= endDateUTC) {
          throw { message: "The StartDate you specify must come before the EndDate." };
        }
      }
      const scheduleDetails: any = {
        id: this.schedulersDetails.id,
        name: this.schedulersDetails.name,
        description: this.schedulersDetails.description,
        status: "SCHEDULED",
        occurrence: this.schedulersDetails.occurrence,
        payload: this.schedulersDetails.payload || this.payloadList,
        scheduleType: this.schedulersDetails.scheduleType,
        timeZone: this.schedulersDetails.timeZone,
      };
      if (scheduleDetails.occurrence == 'ONE_TIME_SCHEDULE') {
        scheduleDetails.scheduledAt = this.schedulersDetails.scheduledAt;
        delete scheduleDetails.scheduleType;
        delete scheduleDetails.startDate;
        delete scheduleDetails.endDate;
      } else {
        if (scheduleDetails.scheduleType === "RATE-BASED") {
          scheduleDetails.rateBasedExpression = this.schedulersDetails.rateBaseValue + ' ' + this.schedulersDetails.rateBaseUnit;
          delete scheduleDetails.cronExpression;
          delete scheduleDetails.scheduledAt;
        } else if (scheduleDetails.scheduleType === "CRON-BASED") {
          scheduleDetails.cronExpression = this.cronInputs.map((input: any) => input.value).join(' ');
          delete scheduleDetails.rateBasedExpression;
          delete scheduleDetails.scheduledAt;
        }

        if (scheduleDetails.scheduleType == 'CRON-BASED') {
          if (!scheduleDetails.cronExpression) throw { message: "Please Enter Cron Expression" }
        }
        if (scheduleDetails.scheduleType == 'RATE-BASED') {
          if (!scheduleDetails.rateBasedExpression) throw { message: "Please Enter Rate Expression" }
        }
        scheduleDetails.scheduledAt = this.schedulersDetails.scheduledAt
        scheduleDetails.startDate = this.schedulersDetails.startDate;
        scheduleDetails.endDate = this.schedulersDetails.endDate;
      }
      if (this.sourceSystemId || this.schedulerPage) { //Source system edit flow
        if (scheduleDetails.id || this.schedulerEditId) {
          await this.schedulerService.updateScheduler(this.sourceSystemId, scheduleDetails.id, scheduleDetails).toPromise();
        } else {
          await this.schedulerService.createScheduler(this.sourceSystemId, scheduleDetails).toPromise();
        }
        if (this.schedulerPage) {
          this.schedulersDetails = {};
          this.router.navigateByUrl('/data-setup/scheduler');
          this.progressWizard.reset();
        }
      } else {
        if (scheduleDetails.id && !this.schedulerPage) {
          const indexToUpdate = this.schedulerList.findIndex((scheduler: any) => scheduler.id === scheduleDetails.id);
          this.schedulerList[indexToUpdate] = scheduleDetails;
        } else {
          this.schedulerList.push(scheduleDetails);
        }
      }
      if (!this.schedulerPage) {
        this.closeModel();
        await this.scheduler_Table?.init();
        this.schedulersDetails = {};
      }
    } catch (e: any) {
      this.commonService.hideLoader();
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    } finally {
      this.commonService.hideLoader();
    }
  }

  exitSchedular() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    });

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You're about to exit. Any unsaved changes will be lost.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, stay!',
      confirmButtonColor: "#5164b8",
      cancelButtonColor: "#d33",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/data-setup/scheduler']);
      }
    });
  }
  exitSchedularInSourcePage() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    });

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You're about to exit. Any unsaved changes will be lost.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, stay!',
      confirmButtonColor: "#5164b8",
      cancelButtonColor: "#d33",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.closeModel();
      }
    });
  }
  //
  toggleChanged() {
    this.schedulersDetails.occurrence = this.schedulersDetails.occurrence == 'RECURRING_SCHEDULE' ? 'ONE_TIME_SCHEDULE' : 'RECURRING_SCHEDULE';
  }
  baseScheduleChanged() {
    this.schedulersDetails.scheduleType = this.schedulersDetails.scheduleType == 'RATE-BASED' ? 'CRON-BASED' : 'RATE-BASED';
  }

  async testConnection() {
    try {
      const buildObj = {
        "category": this.sourceSystemDetails.category,
        "subCategory": this.sourceSystemDetails.subCategory,
        "connection": {
          "host": this.connection.host,
          "port": this.connection.port,
          "user": this.connection.user,
          "password": this.connection.password,
          "schema": this.connection.schema
        }
      }
      this.commonService.showLoader();
      await this.sourceSystemService.testConnection(buildObj).toPromise();
      this.commonService.toster.show("SUCCESS", 'Connection Successful');
    } catch (e: any) {
      console.log(e);
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    } finally {
      this.commonService.hideLoader();
    }
  }



  async confirmDelete(data: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    });

    await swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete Scheduler!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: "#5164b8",
      cancelButtonColor: "#d33",
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.commonService.showLoader();
        try {
          this.deleteUserSegment(data)
          this.commonService.hideLoader();
          Swal.fire({
            title: 'Deleted!',
            text: 'Scheduler has been removed.',
            icon: 'success'
          });
        } catch (e: any) {
          this.commonService.hideLoader();
          this.commonService.toster.error(e.error?.error?.message || e.message || e || 'Delete Failed');
        }
      }
    });
  }

  async swiperStatus(data: any) {
    const newStatus = data.status === 'ACTIVE' ? 'DEACTIVE' : 'ACTIVE';
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      subHeader: `You Want to Change Status as ${newStatus}.`,
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
            this.schedularStatusChange(data);
          }
        },
      ],
    });
    await alert.present();
  }
  // sourceSystemId
  // async schedularStatusChange(data: any) {
  //   try {
  //     this.commonService.showLoader();
  //     if (this.schedulerList.length) {
  //       const schedulerToUpdate = this.schedulerList.find((scheduler: any) => scheduler.id === data.id);
  //       if (schedulerToUpdate) {
  //         if (data.status === 'SCHEDULED') {
  //           schedulerToUpdate.status = 'DISABLED';
  //         } else if (data.status === 'DISABLED') {
  //           schedulerToUpdate.status = 'ENABLED';
  //         }
  //       }
  //     } else {
  //       if (data.status == "DISABLED") {
  //         await this.schedulerService.changeStatusActive(data.sourceSystemId, data.id).toPromise();
  //       } else if (data.status == "SCHEDULED") {
  //         await this.schedulerService.changeStatusDeactive(data.sourceSystemId, data.id).toPromise();
  //       }
  //     }
  //     await this.scheduler_Table?.init();
  //   } catch (e: any) {
  //     this.commonService.toster.error(e.error?.error?.message || e.message || e);
  //   } finally {
  //     this.commonService.hideLoader();
  //   }
  // }

  async schedularStatusChange(data: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    });

    try {
      const result = await swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "This action will change the scheduler's status!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Change Status!',
        cancelButtonText: 'No, cancel!',
        confirmButtonColor: "#5164b8",
        cancelButtonColor: "#d33",
        reverseButtons: true
      });

      if (result.isConfirmed) {
        this.commonService.showLoader();
        if (this.schedulerList.length) {
          const schedulerToUpdate = this.schedulerList.find((scheduler: any) => scheduler.id === data.id);
          if (schedulerToUpdate) {
            if (data.status === 'SCHEDULED') {
              schedulerToUpdate.status = 'DISABLED';
            } else if (data.status === 'DISABLED') {
              schedulerToUpdate.status = 'ENABLED';
            }
            await this.scheduler_Table?.init();
            Swal.fire({
              title: 'Status Changed!',
              text: 'Scheduler status has been updated locally.',
              icon: 'success'
            });
          }
        } else {
          if (data.status == "DISABLED") {
            await this.schedulerService.changeStatusActive(data.sourceSystemId, data.id).toPromise();
          } else if (data.status == "SCHEDULED") {
            await this.schedulerService.changeStatusDeactive(data.sourceSystemId, data.id).toPromise();
          }
          await this.scheduler_Table?.init();
          Swal.fire({
            title: 'Status Changed!',
            text: 'Scheduler status has been updated remotely.',
            icon: 'success'
          });
        }
      }
    } catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    } finally {
      this.commonService.hideLoader();
    }
  }

  async deleteUserSegment(data: any) {
    try {
      this.commonService.showLoader();
      if (this.sourceSystemId) {
        await this.schedulerService.deleteScheduler(this.sourceSystemId, data.id).toPromise();
      } else {
        const removeObj = this.schedulerList.findIndex((scheduler: any) => scheduler.id === data.id);
        if (removeObj !== -1) {
          this.schedulerList.splice(removeObj, 1);
        }
      }
      await this.scheduler_Table?.init();
    } catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    } finally {
      this.commonService.hideLoader();
    }
  }
  getSchedulerData(params: any) {
    if (this.sourceSystemId) {
      return this.schedulerService.getAllSchedulerBySourceSystem(this.sourceSystemId, params).toPromise();
    } else {
      return this.schedulerList;
    }
  }
  generateId(): number {
    this.idCounter++;
    return this.idCounter;
  }

  // getSchedularDataById(data?: any) {
  //   if (data.id) {
  //     this.openModelName == 'SCHEDULER'
  //   } else {
  //     this.openModelName == 'SCHEDULER'
  //   }
  // }

  async autoMappingForObject() {
    try {
      this.commonService.showLoader();
      const configSourceSystem: any = this.sourceList.filter((sourceSystemObj: any) => this.selectedSourceNameList.includes(sourceSystemObj.name));
      const targetDataStruc: any = {};
      this.cdpDataModelList.forEach((item: any) => {
        if (!targetDataStruc[item.module]) {
          targetDataStruc[item.module] = [item.name];
        } else {
          targetDataStruc[item.module].push(item.name);
        }
      });
      const attributeMapping: any = {
        source: configSourceSystem,
        targets: targetDataStruc,
      }
      this.config.objectMapping = await this.sourceSystemService.getObjectMapping(attributeMapping);
      this.loadObjects();
    } catch (e: any) {
      this.commonService.hideLoader();
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    } finally {
      this.commonService.hideLoader();
    }
  }
  async autoMapping() {
    try {
      this.commonService.showLoader();
      const configSourceSystem: any = this.sourceList.filter((sourceSystemObj: any) => this.selectedSourceNameList.includes(sourceSystemObj.name));
      const targetNamesArray = this.targetList.map((targetSystemObj: any) => targetSystemObj.name);
      const configTargetSystem: any = targetNamesArray.filter((name: string) => this.selectedTargetNameList.includes(name));
      const attributeMapping: any = {
        source: configSourceSystem,
        targets: configTargetSystem,
      }
      this.config.objectMapping = await this.sourceSystemService.getAttributeMapping(attributeMapping);
      this.loadObjects();
      // this.switchToObjectView();
    } catch (e: any) {
      this.commonService.hideLoader();
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    } finally {
      this.commonService.hideLoader();
    }
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
  }


  async ChangeScheduleName(data: any) {
    this.commonService.showLoader();
    try {
      const attr: any = await this.sourceSystemService.getFlowChartAttribute(data.id).toPromise();
      this.mappedSourceObjectList = attr.sourceName;
      this.sourceSystemId = data.id;
    } catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    } finally {
      this.commonService.hideLoader();
    }
  }
}
