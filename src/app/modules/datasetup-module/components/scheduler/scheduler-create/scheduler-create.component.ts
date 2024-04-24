import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SourceSystemService } from 'src/app/modules/datasetup-module/services/source-system.service';

@Component({
  selector: 'app-scheduler-create',
  templateUrl: './scheduler-create.component.html',
  styleUrls: ['./scheduler-create.component.scss'],
})
export class SchedulerCreateComponent implements OnInit {
  payloadList = [
    { name: "Start", type: "START" },
    { name: "End", type: "END" }
  ]

  sourceSystemList: any;
  schedulerEditId: any;

  constructor(private route: ActivatedRoute, private sourceSystemService: SourceSystemService) { }

  ngOnInit() {
    this.schedulerEditId = this.route.snapshot.params['scheduler_id'];
    this.init();
  }

  async init() {
    await Promise.all([
      this.getExternalSourceSystem(),
    ]);
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



}
