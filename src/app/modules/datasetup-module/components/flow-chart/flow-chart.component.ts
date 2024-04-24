import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-flow-chart',
  templateUrl: './flow-chart.component.html',
  styleUrls: ['./flow-chart.component.scss'],
})
export class FlowChartComponent implements OnInit {

  @ViewChild('stepPopover') stepPopover: any;
  @ViewChild('editpopover') editPopover: any;

  @Input() stepNameList: any;
  @Input() stepList: any;

  popoverObj = {
    isObjectMapping: false,
    isUpdate: false
  }

  selectedRef: any = {};

  filteredStepNameList: any[] = [];
  searchTerm: string = '';

  inputValue: string = '';

  @Output() searchEvent = new EventEmitter<string>();
  // onInputChange() {
  //   this.inputChanged.emit(this.inputValue);
  // }


  constructor() { }

  ngOnInit() {
    this.updateNames();
  }
  onSearch(event: any) {
    const searchTerm = event.target.value;
    this.searchEvent.emit(searchTerm);
    this.filteredStepNameList = this.stepNameList.filter((item: string) =>
      item.toLowerCase().includes(searchTerm)
    );
  }
  updateNames() {
    const names = this.extractNames(this.stepList);
    this.stepNameList = this.stepNameList.filter((name: any) => !names.includes(name));
  }

  popoverOpen(e: Event, stepList: any, index: number, popoverId: any, includeAddChild: boolean = false) {
    this.filteredStepNameList = this.stepNameList;
    this.selectedRef = { stepList, index, includeAddChild };

    if (popoverId == 'stepPopover') {
      this.stepPopover.event = e;
      this.popoverObj.isObjectMapping = true;
    }

    else if (popoverId == 'updatePopover') {
      this.editPopover.event = e;
      this.popoverObj.isUpdate = true;
    }
  }

  addStep(name: any) {
    const { stepList, index } = this.selectedRef;
    stepList.splice(index + 1, 0, { type: "STEP", name });
    this.updateNames();
  }

  addChildren() {
    const { stepList, index } = this.selectedRef;
    stepList[index].children = [
      { flowList: [] },
      { flowList: [] }
    ]
  }

  deleteStep(stepList: any, index: any) {
    this.stepNameList.push(stepList[index].name);
    stepList.splice(index, 1);
    this.updateNames();
  }

  deleteChildren(stepList: any, index: number) {
    stepList[index].children.forEach((child: any) => {
      child.flowList.forEach((flow: any) => {
        this.stepNameList.push(flow.name);
      });
    });
    stepList[index].children = [];
    this.updateNames();
  }

  updateStep(name: any) {
    const { stepList, index } = this.selectedRef;
    let temp = JSON.parse(JSON.stringify(stepList[index]));
    stepList[index].name = name;
    this.stepNameList.push(temp.name);
    this.updateNames();
  }

  extractNames(steps: any[]): string[] {
    const names: string[] = [];

    steps.forEach(step => {
      if (step.type == 'STEP')
        names.push(step.name);

      if (step.children) {
        step.children.forEach((child: any) => {
          if (child.flowList) {
            child.flowList.forEach((flow: any) => {
              names.push(flow.name);
            });
          }
        });
      }
    });

    return names;
  }


}
