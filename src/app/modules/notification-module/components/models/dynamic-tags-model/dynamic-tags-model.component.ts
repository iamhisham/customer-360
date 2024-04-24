import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificationService } from 'src/app/modules/notification-module/services/notification.service';

@Component({
  selector: 'app-dynamic-tags-model',
  templateUrl: './dynamic-tags-model.component.html',
  styleUrls: ['./dynamic-tags-model.component.scss'],
})
export class DynamicTagsModelComponent  implements OnInit {

  @Input() template: any;
  @Input() isTemplateScreen: boolean = false;
  constructor(public notifiService: NotificationService, private modalController: ModalController) { }
  ngOnInit() {
    if (this.template.dynamic_tags.length == 0) {
      this.template.dynamic_tags.push({});
    }
  }
  addDynamicTag() {
    this.template.dynamic_tags.push({});
  }
  removeDynamicTag(index: any) {
    this.template.dynamic_tags.splice(index, 1);
  }
  async save() {
    try {
      this.template.dynamic_tags.forEach((tag: any) => {
        if (!tag.name) throw { message: "Please enter tag name" };
      });
      await this.modalController.dismiss();
    } catch (e: any) {
      alert(e.message);
    }
    // console.log(this.template.dynamic_tags);
  }
}
