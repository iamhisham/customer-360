import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-retry-modal-popup-component',
  templateUrl: './retry-modal-popup-component.component.html',
  styleUrls: ['./retry-modal-popup-component.component.scss'],
})
export class RetryModalPopupComponentComponent  implements OnInit {
  @Input() response: any;
  @Input() isSuccess: boolean = false;
  
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  modalClose() {
    this.modalCtrl.dismiss();
  }

}
