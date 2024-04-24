import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController, ModalController, PopoverController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  duration: number = 2000;

  date_format: string = 'dd MMM yyyy';
  date_time_format: string = 'dd MMM yyyy hh:mm a';
  date_time_format_with_sec = 'dd MMM yyyy hh:mm:ss a'
  time_format: string = 'hh:mm a';
  date_only_format: string = 'dd';

  isLoaderDismissed: boolean = false;
  showCustomerSearchPopover: boolean = false;
  themeName: string = document.body.classList[0];

  customPopoverOptions: any = {
    cssClass: 'popover-wide',
  };

  constructor(private toastController: ToastController, private loadingCtrl: LoadingController,
    private alertController: AlertController, private modalController: ModalController, private popoverController: PopoverController) { }

  toster = {
    success: (message: string) => {
      this.duration = 2000;
      this.toster.show('SUCCESS', message);
    },
    error: (message: any) => {
      this.duration = 5000;
      this.toster.show('ERROR', message);
    },
    show: async (type: string, message: any) => {
      const toast = await this.toastController.create({
        message: message,
        duration: this.duration,
        icon: type == 'SUCCESS' ? 'checkmark-outline' : 'close-outline',
        cssClass: type == 'SUCCESS' ? 'toaster-style' : 'cancel-toaster-style',
        position: 'bottom',
      });
      await toast.present();
    }
  };

  storage = {
    get: async (key: string) => {
      return ((await Preferences.get({ key })) || {}).value;
    },
    set: async (key: string, value: string) => {
      return await Preferences.set({ key, value });
    },
    remove: async (key: string) => {
      return await Preferences.remove({ key });
    },
    clear: async () => {
      return await Preferences.clear();
    },
  };

  //spinner controller
  async showLoader() {
    this.isLoaderDismissed = false;
    const loader = await this.loadingCtrl.create({
      message: 'Please wait...',
      spinner: 'lines-sharp',
      cssClass: 'ion-loading-class',
      translucent: true
    });
    if (!this.isLoaderDismissed && !(await this.loadingCtrl.getTop())) {
      await loader.present();
    }
  }

  async hideLoader() {
    try {
      this.isLoaderDismissed = true;
      if (await this.loadingCtrl.getTop()) {
        await this.loadingCtrl.dismiss();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async closeAllAlertCtrl() {
    var alertCtrl = await this.alertController.getTop();
    if (alertCtrl) await alertCtrl.dismiss();
    var modalCtrl = await this.modalController.getTop();
    if (modalCtrl) await modalCtrl.dismiss();
    var popoverCtrl = await this.popoverController.getTop();
    if (popoverCtrl) await popoverCtrl.dismiss();
    var loaderCtrl = await this.loadingCtrl.getTop();
    if (loaderCtrl) await loaderCtrl.dismiss();
  }

  scrollContent(id: any) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  swipeAcountSelectedIntoView(element: any, parentElement: any, leftElement: any, rightElement: any, animiDuration: number) {
    const eleDim: any = element.getBoundingClientRect();
    const parentDim: any = parentElement.getBoundingClientRect();
    if (parentDim.x > eleDim.x) {
      leftElement.click();
      setTimeout(() => this.swipeAcountSelectedIntoView(element, parentElement, leftElement, rightElement, animiDuration), animiDuration);
    } else if ((parentDim.x + parentDim.width) < (eleDim.x + eleDim.width)) {
      rightElement.click();
      setTimeout(() => this.swipeAcountSelectedIntoView(element, parentElement, leftElement, rightElement, animiDuration), animiDuration);
    }
  }

}
