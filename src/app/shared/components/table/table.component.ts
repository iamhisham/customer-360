import { Component, Input, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonService } from '../../../service/common.service';

import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  [x: string]: any;
  @Input() tableDetails: any;

  showLoadingIcon: boolean = false;
  isinitialDataLoaded: boolean = false;
  displayedColumns: any = [];
  dataSource: any;
  pageSize: number | undefined;
  records: any = [];
  totalCount: any;
  apiParams: any = {};
  // filter
  filterDetails: any = {};
  currentFilter: any = {
  };
  possibleFilterCond: any = {
    'TEXT': [
      { name: 'Equal to', value: 'eq' },
      { name: 'Not equal to', value: 'ne' },
      { name: 'Contains', value: 'like' },
      { name: 'Not Contains', value: 'notLike' },
      { name: 'Starts with', value: 'startsWith' },
      { name: 'Ends with', value: 'endsWith' },
      { name: 'Is Null', value: 'null' },
      { name: 'Is Not Null', value: 'notnull' }
    ],
    'ID': [
      { name: 'Equal to', value: 'eq' },
      { name: 'Not equal to', value: 'ne' },
      { name: 'Contains', value: 'in' },
      { name: 'Not Contains', value: 'notIn' },
      { name: 'Is Null', value: 'null' },
      { name: 'Is Not Null', value: 'notnull' }
    ],
    'NUMBER': [
      { name: 'Equal to', value: 'eq' },
      { name: 'Not equal to', value: 'ne' },
      { name: 'Lesser than', value: 'lt' },
      { name: 'Lesset than equal to', value: 'lte' },
      { name: 'Greater than', value: 'gt' },
      { name: 'Greater than equal to', value: 'gte' },
      { name: 'Between', value: 'bwt' },
      { name: 'Is Null', value: 'null' },
      { name: 'Is Not Null', value: 'notnull' }
    ],
    'DURATION': [
      { name: 'Equal to', value: 'eq' },
      { name: 'Not equal to', value: 'ne' },
      { name: 'Lesser than', value: 'lt' },
      { name: 'Lesset than equal to', value: 'lte' },
      { name: 'Greater than', value: 'gt' },
      { name: 'Greater than equal to', value: 'gte' },
      { name: 'Between', value: 'bwt' },
      { name: 'Is Null', value: 'null' },
      { name: 'Is Not Null', value: 'notnull' }
    ],
    'DATE': [
      { name: 'Equal to', value: 'eq' },
      { name: 'Not equal to', value: 'ne' },
      { name: 'Lesser than', value: 'lt' },
      { name: 'Lesset than equal to', value: 'lte' },
      { name: 'Greater than', value: 'gt' },
      { name: 'Greater than equal to', value: 'gte' },
      { name: 'Between', value: 'bwt' },
      { name: 'Is Null', value: 'null' },
      { name: 'Is Not Null', value: 'notnull' }
    ],
    'DATETIME': [
      { name: 'Equal to', value: 'eq' },
      { name: 'Not equal to', value: 'ne' },
      { name: 'Lesser than', value: 'lt' },
      { name: 'Lesset than equal to', value: 'lte' },
      { name: 'Greater than', value: 'gt' },
      { name: 'Greater than equal to', value: 'gte' },
      { name: 'Between', value: 'bwt' },
      { name: 'Is Null', value: 'null' },
      { name: 'Is Not Null', value: 'notnull' }
    ]
  }

  tablefilterPopoverOptions: any = {
    cssClass: 'table-popover-wide',
  };

  currentView: any = {};
  isColumnConfigPopoverOpen: boolean = false;
  isColumnConfigModalOpen: boolean = false;
  startDateTimeTempVariable: string = '';
  endDateTimeTempVariable: string = '';

  @ViewChild(MatPaginator) paginators!: MatPaginator;
  @ViewChild(MatSort) sorts!: MatSort;
  @ViewChild('mytable', { read: ElementRef }) public widgetsContent!: ElementRef<any>;
  @ViewChild('filterPopover') filterPopover: any;
  @ViewChild('headerPopover') headerPopover: any;
  @ViewChild('selectAllCheckbox', { read: ElementRef }) public selectAllCheckbox!: ElementRef<any>;

  @ViewChild('picker') picker: any;

  constructor(public commonService: CommonService, public modalController: ModalController) { }

  ngOnInit() {
    this.closeFilterPopover();
  }

  ngAfterViewInit() {
    if (this.tableDetails.pageSize) {
      this.pageSize = this.paginators.pageSize = this.tableDetails.pageSize;
    }
    this.init();
    this.sorts.sortChange.subscribe(() => {
      this.paginators.pageIndex = 0;
      if (this.tableDetails.needServerSidePagination) {
        this.getRecordsAndLoadData();
        this.resetAll();
      }
    });

  }

  resetAll() {
    this.records = [];
    this.tableDetails.totalCount = this.totalCount = 0;
    this.tableDetails.selectedIdList = [];
    if (this.dataSource) this.dataSource.data = [];
    this.currentView = {};
    if (this.selectAllCheckbox?.nativeElement) {
      var element = this.selectAllCheckbox.nativeElement.querySelector('input[type="checkbox"]');
      if (element.checked) element.click();
    }
  }

  async init() {
    try {
      this.resetAll();
      this.initDataSource();
      // if(this.tableDetails.filter && Object.keys(this.tableDetails.filter).length > 0){
      await this.applyFilterAndSort();
      // }
    } catch (e: any) {
      this.commonService.toster.error((e.error?.error?.message || e.message || e) || 'Failed');
    }
  }

  async getRecordsAndLoadData() {
    try {
      this.showLoadingIcon = true;
      const apiParams = JSON.parse(JSON.stringify(this.apiParams));
      //Embed Filed Details
      if (this.tableDetails.embed) apiParams.embed = this.tableDetails.embed;
      //Pagination Details
      apiParams.page = this.paginators.pageIndex + 1;
      apiParams.limit = this.paginators.pageSize;
      //Sort Details
      if (this.sorts.direction) {
        // lo
        const { filterAttr, sortAttr, attr } = this.tableDetails.fields.find((obj: any) => obj.attr == this.sorts.active);
        apiParams.orderBy = (sortAttr || filterAttr || attr) + ' ' + this.sorts.direction;
      } else {
        delete apiParams.orderBy;
      }

      var result = await this.tableDetails.getRecord(apiParams);
      if (typeof (result.toPromise) == 'function') result = await result.toPromise();
      var data: any = null;
      var totalRecords: any = null;
      if (result instanceof Array) {
        data = result;
        totalRecords = data.length;
      } else {
        data = result.data;
        totalRecords = result._metadata ? result._metadata.totalRecords : data.length;
        // totalRecords = result._metadata.totalRecords;
      }
      this.isinitialDataLoaded = true;
      this.loadData(data, totalRecords);
    } catch (e) {
      console.log(e);
    }
    this.showLoadingIcon = false;
  }

  initDataSource() {
    if (!this.dataSource) {
      this.tableDetails.reload = async () => await this.init();
      this.tableDetails.unSelectAll = () => this.unSelectAll();

      this.displayedColumns = this.tableDetails.fields.map((obj: any) => obj.attr);
      if (this.tableDetails.isSelectableGrid) {
        this.displayedColumns.unshift('checkbox');
      }
      if ((this.tableDetails.actions || []).length > 0) {
        this.displayedColumns.push('final');
      }
      this.dataSource = new MatTableDataSource();
      if (!this.tableDetails.needServerSidePagination) this.dataSource.sort = this.sorts;
      this.dataSource.paginator = this.paginators;
      this.paginators._intl.itemsPerPageLabel = 'Display';
      if (this.tableDetails.filter) {
        this.filterDetails = JSON.parse(JSON.stringify(this.tableDetails.filter));
      }
      if (this.tableDetails.orderBy) {
        const [orderByKey, direction]: any = this.tableDetails.orderBy.split(' ');
        this.sorts.active = orderByKey;
        this.sorts.direction = direction;
      }
    }
  }

  loadData(records: any, totalCount: any) {
    this.tableDetails.totalCount = this.totalCount = totalCount;
    this.records = this.records.concat(this.tableDetails.buildData ? this.tableDetails.buildData(records) : records);
    this.renderData();
  }

  renderData() {
    this.dataSource.data = this.tableDetails.getFilteredRecords ? this.tableDetails.getFilteredRecords(this.records) : this.records;
    this.search();
    this.tableDetails.isRendered = true;
  }

  search() {
    this.dataSource.filter = (this.tableDetails.search || '').trim().toLowerCase();
    if (!this.dataSource.filter) this.renderPaginationCount();
  }

  async applyFilterCriteria(params?: any) {
    try {
      if (this.tableDetails.needServerSidePagination) {
        this.resetAll();
        this.apiParams = params || this.getParams();
        await this.getRecordsAndLoadData();
      } else {
        if(this.isinitialDataLoaded){
          this.renderData();
        }else{
          await this.getRecordsAndLoadData();
        }
      }
    } catch (e: any) {
      e = (e.error?.error?.message || e.message || e);
    }
  }

  getParams() {
    const params: any = {};
    Object.keys(this.tableDetails.filterCriteria || {}).forEach((key: string) => {
      var value = this.tableDetails.filterCriteria[key];
      if (value != null) {
        value = value instanceof Array ? value.join(',') : value;
        if (value != '') params[key] = value;
      }
    });
    return params;
  }

  renderPaginationCount() {
    if (this.totalCount != this.records.length) {
      setTimeout(() => this.paginators.length = this.totalCount, 100);
    }
  }

  async pageChanged(event: PageEvent) {
    if (!this.tableDetails.needServerSidePagination) return;
    var recordCount = this.records.length;
    var currentPageTotalCount = event.pageSize * (event.pageIndex + 1);
    try {
      if (this.pageSize !== event.pageSize) {
        this.pageSize = event.pageSize;
        this.paginators.pageIndex = event.pageIndex = 0;
        this.resetAll();
        await this.getRecordsAndLoadData();
      } else if (this.totalCount != recordCount && currentPageTotalCount > recordCount) {
        await this.getRecordsAndLoadData();
      }
      setTimeout(() => {
        this.paginators.pageIndex = event.pageIndex;
        this.paginators.length = this.totalCount;
      }, 100);
    } catch (e: any) {
      e = (e.error?.error?.message || e.message || e);
      this.commonService.toster.error(e.message || 'Failed');
    }
  }

  /* Grid Filter Starts */
  openFilterPopover(e: Event, obj: any) {
    e.stopPropagation();
    this.filterPopover.event = e;
    // this.currentFilter.isOpen = true;
    if (obj.filterType) {
      const attr = obj.filterAttr || obj.attr;
      const previousFilter = this.filterDetails[attr] || {};

      this.currentFilter = {
        isOpen: true,
        attr: attr,
        type: obj.filterType,
        isSearch: obj.isShowSearch,
        searchValue: "",
        enums: obj.filterEnums || [],
        cond: previousFilter.cond || 'eq',
        value: previousFilter.value || '',
        value2: previousFilter.value2 || '',
        unit: previousFilter.unit || 'ms',
        selectedEnums: JSON.parse(JSON.stringify((previousFilter.selectedEnums || []))),
      };
    }
  }

  async updateFilter(filterDetails: any) {
    this.filterDetails = JSON.parse(JSON.stringify(filterDetails));
    this.closeFilterPopover();
    await this.applyFilter();
  }

  async applyFilter() {
    try {
      const { attr, type, cond, value, value2, unit, selectedEnums, enums } = this.currentFilter;
      const isNullOrNotNull = (cond == 'null' || cond == 'notnull');
      switch (type) {
        case 'TEXT':
          if (!cond) throw { message: "Please Select Condition" };
          if (!isNullOrNotNull && !value) throw { message: "Please Enter Value" };
          break;
        case 'ENUMS':
          if (selectedEnums.length == 0) throw { message: "Please Select Atleast one Enum Values" };
          this.currentFilter.isSelectAll = selectedEnums.length === enums.length;
          break;
        case 'ID':
          if (!cond) throw { message: "Please Select Condition" };
          if (!isNullOrNotNull && !value && value != 0) throw { message: "Please Enter Id" };
          break;
        case 'DURATION':
          if (!cond) throw { message: "Please Select Condition" };
          if (!isNullOrNotNull && !value && value != 0) throw { message: "Please Enter Value" };
          if (!isNullOrNotNull && !unit) throw { message: "Please Enter Unit" };
          break;
        case 'NUMBER':
          if (!cond) throw { message: "Please Select Condition" };
          if (cond == 'bwt') {
            if (!value && value != 0) throw { message: "Please Enter Start Value" };
            if (!value2 && value2 != 0) throw { message: "Please Enter End Value" };
            if (value >= value2) throw { message: "Start value should be less than End Date" };
          } else if (!isNullOrNotNull && !value && value != 0) throw { message: "Please Enter Value" };
          break;
        case 'DATE':
        case 'DATETIME':
          if (!cond) throw { message: "Please Select Condition" };
          if (cond == 'bwt') {
            if (!value) throw { message: "Please Select Start Date" };
            if (!value2) throw { message: "Please Select End Date" };
            if (value >= value2) throw { message: "Start Date should be less than End Date" };
          } else if (!isNullOrNotNull && !value) throw { message: "Please Select Date" };
          break;
        default: throw { message: 'Invalid Filter Type!' };
      }
      const previousFilter: any = this.filterDetails[attr];

      if (!previousFilter ||
        (previousFilter.cond || '') != cond
        || previousFilter.value != value
        || previousFilter.value2 != value2
        || previousFilter.unit != unit
        || previousFilter.selectedEnums.length != selectedEnums.length
        || previousFilter.selectedEnums.find((text: any) => !selectedEnums.includes(text)) != null) {
        this.filterDetails[attr] = this.currentFilter;
        this.closeFilterPopover();
        await this.applyFilterAndSort();
      } else {
        this.closeFilterPopover();
      }
    } catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    }
  }

  async resetFilter() {
    try {
      this.endDateTimeTempVariable = '';
      this.startDateTimeTempVariable = '';
      if (this.filterDetails[this.currentFilter.attr]) {
        delete this.filterDetails[this.currentFilter.attr];
        this.closeFilterPopover();
        await this.applyFilterAndSort();
      }
      this.closeFilterPopover();
    } catch (e) {
      this.commonService.toster.error(e);
    }
  }

  closeFilterPopover() {
    this.currentFilter.isOpen = false;
  }

  async applyFilterAndSort() {
    const params: any = {};
    try {
      Object.entries(this.filterDetails).forEach(([field, obj]: any) => {
        var { attr, type, cond, value, value2, unit, selectedEnums, isSelectAll } = obj;
        if (cond == 'null') {
          params[attr + '-null'] = true;
        } else if (cond == 'notnull') {
          params[attr + '-null'] = false;
        } else {
          const key = attr + (cond == 'eq' ? '' : '-' + cond);
          switch (type) {
            case 'TEXT':
              params[key] = value;
              break;
            case 'ENUMS':
              if (isSelectAll) return;
              params[key] = selectedEnums.join(',');
              break;
            case 'ID':
            case 'NUMBER':
            case 'DATE':
            case 'DATETIME':
              params[key] = cond == 'bwt' ? [value, value2].join(',') : value;
              break;
            case 'DURATION':
              value2 = value2 || 0;
              if (unit == 'sec') {
                value *= 1000;
                value2 *= 1000;
              } else if (unit == 'min') {
                value *= 60 * 1000;
                value2 *= 60 * 1000;
              } else if (unit == 'hr') {
                value *= 60 * 60 * 1000;
                value2 *= 60 * 60 * 1000;
              }
              params[key] = cond == 'bwt' ? [value, value2].join(',') : value;
              break;
            default: throw { message: 'Invalid Filter Type!' };
          }
        }

      });
      await this.applyFilterCriteria(params);
    } catch (e: any) {
      this.commonService.toster.error(e);
    }
  }

  async resetAllFilter() {
    this.isColumnConfigPopoverOpen = false;
    this.filterDetails = {};
    this.apiParams = {};
    this.endDateTimeTempVariable = '';
    this.startDateTimeTempVariable = '';
    if (this.tableDetails.orderBy) {
      const [orderByKey, direction]: any = this.tableDetails.orderBy.split(' ');
      this.sorts.active = orderByKey;
      this.sorts.direction = direction;
    }
    this.sorts.sortChange.emit();
  }

  selectOrUnselectAllEnums(event: any) {
    if (!event.target.checked) {
      this.currentFilter.selectedEnums = this.currentFilter.enums.map((data: any) => {
        return data.value
      })
    } else {
      this.currentFilter.selectedEnums = [];
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  selectEnum(event: any, value: any) {
    if (!event.target.checked) {
      this.currentFilter.selectedEnums.push(value);
    } else {
      this.currentFilter.selectedEnums.splice(this.currentFilter.selectedEnums.findIndex((data: any) => data === value), 1);
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  /* Grid Filter Ends */

  /* Grid Row Selection Starts */

  selectAllRowInCurrentView(event: any) {
    const { selectedIdList } = this.tableDetails;
    const startRecordIndex = this.paginators.pageIndex * this.paginators.pageSize;
    const endRecordIndex = (this.paginators.pageIndex + 1) * this.paginators.pageSize;

    for (var i = startRecordIndex; i < endRecordIndex && i < this.dataSource.data.length; i++) {
      var element = this.dataSource.data[i];
      var selectedRowId = element[this.tableDetails.pk];
      if (event.checked && this.tableDetails.isCheckboxVisible && !this.tableDetails.isCheckboxVisible(element)) {
        continue;
      }
      var index = selectedIdList.indexOf(selectedRowId);
      if (event.checked && index == -1) {
        selectedIdList.push(selectedRowId);
      } else if (!event.checked && index != -1) {
        selectedIdList.splice(index, 1);
      }
    }
    this.updateCurrentViewCheckbox();
  }

  selectRow(event: any, el: any) {
    const { selectedIdList } = this.tableDetails;
    const selectedRowId = el[this.tableDetails.pk];
    var index = selectedIdList.indexOf(selectedRowId);
    if (event.checked && index == -1) {
      selectedIdList.push(selectedRowId);
    } else if (!event.checked && index != -1) {
      selectedIdList.splice(index, 1);
    }
    this.updateCurrentViewCheckbox();
  }

  unSelectAll() {
    this.tableDetails.selectedIdList = [];
    this.updateCurrentViewCheckbox();
    var element = this.widgetsContent.nativeElement.querySelector("table th:nth-child(2)");
    if (element) {
      element.dispatchEvent(new Event('focus', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));
    }
  }

  updateCurrentViewCheckbox() {
    const { selectedIdList } = this.tableDetails;
    const startRecordIndex = this.paginators.pageIndex * this.paginators.pageSize;
    const endRecordIndex = (this.paginators.pageIndex + 1) * this.paginators.pageSize;

    const currentViewSelectedList: any = [];
    const currentViewUnSelectedList: any = [];
    for (var i = startRecordIndex; i < endRecordIndex && i < this.dataSource.data.length; i++) {
      var selectedRowId = this.dataSource.data[i][this.tableDetails.pk];
      if (selectedIdList.indexOf(selectedRowId) != -1) {
        currentViewSelectedList.push(selectedRowId);
      } else {
        currentViewUnSelectedList.push(selectedRowId);
      }
    }
    this.currentView.isAllSelected = (currentViewUnSelectedList.length == 0);
    this.currentView.isInterminateSelected = (currentViewSelectedList.length > 0 && currentViewUnSelectedList.length > 0);
    if (this.selectAllCheckbox?.nativeElement) {
      var element = this.selectAllCheckbox.nativeElement.querySelector('input[type="checkbox"]');
      if (!this.currentView.isAllSelected && !this.currentView.isInterminateSelected && element.checked) {
        element.click();
      }
    }
  }

  isFilterDetailsEmpty() {
    return Object.keys(this.filterDetails).length > 0;
  }

  /* DATE TIME adjust Starts */
  endDateTimeAdjustTime() {
    if (this.currentFilter.type === "DATETIME") {
      const selectedDate: any = this.endDateTimeTempVariable;
      if (selectedDate.getHours() === 0 && selectedDate.getMinutes() === 0 && selectedDate.getSeconds() === 0) {
        selectedDate.setHours(23, 59, 0, 0);
      }
    }
  }

  setStartDateValueInCurrentFilter() {
    this.currentFilter.value = this.startDateTimeTempVariable;
  }

  setEndDateValueInCurrentFilter() {
    this.currentFilter.value2 = this.endDateTimeTempVariable;
  }

  headerTopPopover(event: any) {
    this.headerPopover.event = event;
    this.isColumnConfigPopoverOpen = true;
  }

  columnConfig() {
    this.isColumnConfigPopoverOpen = false;
    this.isColumnConfigModalOpen = true;
  }
}
