import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-progress-bar-component',
  templateUrl: './progress-bar-component.component.html',
  styleUrls: ['./progress-bar-component.component.scss'],
})
export class ProgressBarComponentComponent implements OnInit {

  @Input() progressbarObj: any;
  currentActive = 1;
  progressWidth = '0%';
  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() { }

  update() {
    const actives = this.progressbarObj.slice(0, this.currentActive);
    this.progressWidth = ((actives.length - 1) / (this.progressbarObj.length - 1)) * 100 + '%';
  }

  next() {
    this.currentActive++;
    this.update();
  }

  prev() {
    this.currentActive--;
    this.update();
  }

  checkGoBack(circleId: any) {
    if (this.currentActive > circleId) {
      this.currentActive = circleId;
      this.update();
    }
  }
  reset() {
    this.currentActive = 1;
    this.update();
  }
}


