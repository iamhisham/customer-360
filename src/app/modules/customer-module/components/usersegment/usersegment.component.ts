import { Component, OnInit, ViewChild } from '@angular/core';
import { AnimationController, ModalController, PopoverController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from '../../../../service/common.service';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ConstantService } from '../../../../service/constant.service';
import { SegmentViewPopupComponentComponent } from './segment-view-popup-component/segment-view-popup-component.component';


import Swal from 'sweetalert2';
import { UserSegmentService } from '../../services/user-segment.service';

@Component({
  selector: 'app-usersegment',
  templateUrl: './usersegment.component.html',
  styleUrls: ['./usersegment.component.scss'],
})
export class UsersegmentComponent implements OnInit {

  isRecommendedView: boolean = false;
  recommendationList: any = [];
  userTableDetails: any = {
    name: "user segment",
    pk: "id",
    search: "",
    pageSize: 10,
    needServerSidePagination: true,
    // skipDefaultApiTrigger: true,
    orderBy: "updatedAt desc",
    embed: this.constantService.CONST.SEGMENTS.EMBED_GET_ALL,
    fields: [
      { name: "ID", attr: "id", width: "75", type: "LINK", filterType: 'ID' },
      { name: "Name", attr: "name", width: "175", filterType: 'TEXT' },
      {
        name: "Status", attr: "status", width: "175", className: "textCapitalize", filterType: 'ENUMS',
        filterEnums: [
          { value: "ACTIVE", name: "Active" },
          { value: "DISABLED", name: "Disable" },
        ]
      },
      { name: "Description", attr: "description", width: "150", disableSort: 'true' },
      { name: "Created Time", type: "DATE", format: this.commonService.date_time_format, attr: "createdAt", width: "175", filterType: 'DATETIME' },
      { name: "Updated Time ", type: "DATE", format: this.commonService.date_time_format, attr: "updatedAt", width: "175", filterType: 'DATETIME' },
    ],
    actions: [
      { name: "Edit", attr: 'edit', getLink: (el: any) => '/customers/segments/' + el.id },
      { name: "Clone", attr: 'clone', getLink: (el: any) => '/customers/segments/clone/' + el.id },
      { name: "Disable", clickFunction: (el: any) => this.confirmDelete(el) },
      { name: "View Customer", clickFunction: (el: any) => this.getUserSegmentById(el.id, el.name) }
    ],
    getRecord: (params: any) => this.getAllUserSegment(params),
    buildData: (userList: any) => {
      return userList.map((user: any) => {
        return {
          id: user.id,
          name: user.name,
          status: user.status,
          description: user.description,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          link: {
            id: '/customers/segments/' + user.id
          },
          action: {
            edit: '/customers/segments/' + user.id,
            clone: '/customers/segments/clone/' + user.id,
          }
        };
      });
    }
  };

  @ViewChild('userSegment_grid') userSegmentGrid: TableComponent | undefined;
  @ViewChild('userSegment_search') userSegmentSearch: TableComponent | undefined;

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
  ];
  isInitTriggered: boolean = false;
  constructor(private popover: PopoverController, private datePipe: DatePipe, private modalController: ModalController,
    private commonService: CommonService, private userSegmentService: UserSegmentService, private router: Router,
    private constantService: ConstantService, private animationCtrl: AnimationController) {

  }

  ngOnInit() {
    this.init();
  }

  ionViewWillEnter() {
    this.init();
  }

  ionViewWillLeave() {
    this.isInitTriggered = false;
    this.modalController.dismiss();
  }

  init() {
    if (this.isInitTriggered) return;
    this.isInitTriggered = true;
    this.userSegmentGrid?.init();
  }

  getRecommendationUserSegement() {
    this.commonService.showLoader();
    this.userSegmentService.getRecommendationUserSegement().subscribe(
      {
        next: (recommendationList: any) => {
          this.recommendationList = null;
          this.commonService.hideLoader();
          setTimeout(() => {
            this.recommendationList = recommendationList;
          }, 2000);
        },
        error: (err: any) => {
          this.commonService.hideLoader();
          err = err.error?.error || err.error || err;
          this.commonService.toster.error(err.message || 'Recommendation error');
        }
      }
    )
    this.commonService.hideLoader();
  }


  async confirmDelete(userSegement: any,) {
    this.popover.dismiss();
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger' // Default button classes
      },
      buttonsStyling: true
    });

    await swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Disable it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        this.commonService.showLoader();
        try {
          await this.userSegmentService.deleteUserSegmentById(userSegement.id).toPromise();
          this.commonService.hideLoader();
          this.userSegmentGrid?.init();
          Swal.fire({
            title: 'Disable!',
            text: 'Segment has been Disable.',
            icon: 'success'
          });
        } catch (err: any) {
          this.commonService.hideLoader();
          err = err.error?.error || err.error || err;
          this.commonService.toster.error(err.message || 'segment Disable Failed');
        }
      }
    });
  }

  getAllUserSegment(params: any) {
    return this.userSegmentService.getAllUserSegment(params).toPromise();
  }

  getUserSegmentById(userSegmentId: any, userName: any) {
    this.commonService.showLoader();
    this.userSegmentService.getUserSegmentById(userSegmentId).subscribe({
      next: (userSegment: any) => {
        this.commonService.hideLoader();
        this.openSegmentViewPopup(userSegment.rules, userName)
      },
      error: (err: any) => {
        this.commonService.hideLoader();
        err = err.error?.error || err.error || err;
        this.commonService.toster.error(err.message || 'Failed');
      }
    });
  }

  async openSegmentViewPopup(rules: any, userName: any) {
    const modal = await this.modalController.create({
      component: SegmentViewPopupComponentComponent,
      // enterAnimation: modalAnimation, // Use the animation here
      // leaveAnimation: modalAnimation, // Use the animation here
      cssClass: 'view-user',
      componentProps: {
        usersegementRules: rules,
        userName: userName
      },
      backdropDismiss: false,
    });
    await modal.present();
  }

  enterAnimation = (baseEl: HTMLElement) => {
    const root: any = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0.99', transform: 'translateX(100%) scale(1)' },
        { offset: 1, opacity: '0.99', transform: 'translateX(0) scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease')
      .duration(200)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

  openRecommedationView() {
    this.deleteRecommendUsersegment();
    this.getRecommendationUserSegement();
    // this.recommendationList = [];
    this.isRecommendedView = true;
  }

  recommendationView(name: any, description: any) {
    this.modalController.dismiss();
    this.userSegmentService.selectedRecommendation.name = name;
    this.userSegmentService.selectedRecommendation.description = description;
    if (this.userSegmentService.selectedRecommendation.name && this.userSegmentService.selectedRecommendation.description)
      this.router.navigate(['customers/segments/create']);
  }

  deleteRecommendUsersegment() {
    delete this.userSegmentService.selectedRecommendation.name;
    delete this.userSegmentService.selectedRecommendation.description;
  }

}
