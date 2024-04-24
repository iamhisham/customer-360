import { copyArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SegmentViewPopupComponentComponent } from 'src/app/modules/customer-module/components/usersegment/segment-view-popup-component/segment-view-popup-component.component';
import { CommonService } from 'src/app/service/common.service';
import { UserSegmentService } from 'src/app/modules/customer-module/services/user-segment.service';

@Component({
  selector: 'app-usersegment-create',
  templateUrl: './usersegment-create.component.html',
  styleUrls: ['./usersegment-create.component.scss'],
})
export class UsersegmentCreateComponent implements OnInit {
  myForm!: FormGroup;
  userSegment: any = {
    rules: []
  };
  userSegmentId: any;
  userCount: any = -1;
  showInitialView: boolean = false;

  showUserloader: boolean = false;

  isEditView: boolean = false;
  isCloneView: boolean = false;
  segmentGroups: any = [
    {
      "groupKey": "Transit",
      "groupValue": [
        {
          "attr": "browserType",
          "name": "Browser",
          //  "field": "browser_type",
          "type": "enum",
          "description": "User Tags",
          "isPredefiendTag": false
        },
        {
          "attr": "platform",
          "name": "Device Type",
          //  "field": "platform",
          "type": "enum",
          "description": "User Tags",
          "isPredefiendTag": false
        },
        {
          "attr": "tags",
          "name": "Traffic Source",
          "field": "Traffic_Source",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        },
        {
          "attr": "tags",
          "name": "Landing page URL",
          "field": "Landing_Page_URL",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        }
      ]
    },
    {
      "groupKey": "Behavior",
      "groupValue": [
        {
          "attr": "tags",
          "name": "Time Spent",
          "field": "Time_Spent",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        },
        {
          "attr": "tags",
          "name": "Logged In",
          "field": "Is_Loggedin_User",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        },
        {
          "attr": "tags",
          "name": "Scroll",
          "field": "Scroll",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        }
      ]
    },
    {
      "groupKey": "Visit History",
      "groupValue": [
        {
          "attr": "tags",
          "name": "# of visits in a week",
          "field": "Visits_Per_Week",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        },
        {
          "attr": "tags",
          "name": "Products viewed",
          "field": "Products_Viewed",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        },
        {
          "attr": "tags",
          "name": "Product category",
          "field": "Product_Category",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        },
        {
          "attr": "tags",
          "name": "Product price",
          "field": "Product_Price",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        }
      ]
    },
    {
      "groupKey": "Purhcase History",
      "groupValue": [
        {
          "attr": "tags",
          "name": "Total Spent",
          "field": "Total_Spent",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        },
        {
          "attr": "tags",
          "name": "Last purchase date",
          "field": "Last_Purchase_Date",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        },
        {
          "attr": "tags",
          "name": "Cart items",
          "field": "Cart_Items",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        },
        {
          "attr": "tags",
          "name": "Cart amount",
          "field": "Cart_Amount",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        },
        {
          "attr": "tags",
          "name": "AOV (Average order value) ",
          "field": "AOV",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        },
        {
          "attr": "tags",
          "name": "LTV (Life time value)",
          "field": "LTV",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        }
      ]
    },
    {
      "groupKey": "Device Profile",
      "groupValue": [
        {
          "attr": "platform",
          "name": "Platform",
          //  "field": "Total_Spend",
          "type": "enum",
          "description": "User Platform",
          "isPredefiendTag": false
        },
        {
          "attr": "deviceModel",
          "name": "Device Model",
          //  "field": "Total_Spend",
          "type": "text",
          "description": "User Device Model",
          "isPredefiendTag": false
        },
        {
          "attr": "deviceMake",
          "name": "Device Make",
          //  "field": "Total_Spend",
          "type": "text",
          "description": "User Device Make",
          "isPredefiendTag": false
        },
        {
          "attr": "deviceOs",
          "name": "Device OS",
          //  "field": "Total_Spend",
          "type": "text",
          "description": "User Device OS",
          "isPredefiendTag": false
        }
      ]
    },
    {
      "groupKey": "User Profile",
      "groupValue": [
        {
          "attr": "allUsers",
          "name": "All User",
          //  "field": "Total_Spend",
          "type": "all_users",
          "description": "All Users",
          "isPredefiendTag": false
        },
        {
          "attr": "age",
          "name": "Age",
          //  "field": "Total_Spend",
          "type": "number",
          "description": "User Age",
          "isPredefiendTag": false
        },
        {
          "attr": "gender",
          "name": "Gender",
          //  "field": "Total_Spend",
          "type": "enum",
          "description": "User Gender",
          "isPredefiendTag": false
        },
        {
          "attr": "language",
          "name": "Language",
          //  "field": "Total_Spend",
          "type": "text",
          "description": "User Language",
          "isPredefiendTag": false
        }
      ]
    },
    {
      "groupKey": "Tags",
      "groupValue": [
        {
          "attr": "tags",
          "name": "Tag",
          //  "field": "Total_Spend",
          "type": "tag",
          "description": "User Tags",
          "isPredefiendTag": true
        }
      ]
    }
  ]

  possibleEnumValue: any = {
    gender: [
      { name: "Male", value: "MALE" },
      { name: "Female", value: "FEMALE" }
    ],
    platform: [
      { name: "Android", value: "ANDROID" },
      { name: "IOS", value: "IOS" }
    ],
    role: [
      { name: "Admin", value: "ADMIN" },
      { name: "User", value: "USER" }
    ],
    browser_type: [
      { name: "Chrome", value: "CHROME" },
      { name: "Edge", value: "EDGE" },
      { name: "Safari", value: "SAFARI" },
      { name: "Firefox", value: "FIREFOX" },
      { name: "Opera", value: "OPERA" },
    ]
  };

  addFltr: boolean = true;
  orFltr: boolean = false;
  listOfTags: any; //attribut tags list

  constructor(private userSegmentService: UserSegmentService, 
    private router: Router, private commonService: CommonService, private actRouter: ActivatedRoute, 
    private modalController: ModalController) { }

  ngOnInit() {
    this.init()
    this.getAllAttribute();
    if (this.userSegmentService.selectedRecommendation.description) this.createRecommendedUsersegment();
  }

  ionViewWillLeave() {
    this.deleteRecommendUsersegment();
  }

  init() {
    this.validateForm();
    this.actRouter.paramMap.subscribe((param: Params) => {
      const userSegmentIdJson = param['get']('user_segment_id');
      const cloneUserSegmentIdJson = param['get']('clone_user_segment_id');

      if (!isNaN(Number(userSegmentIdJson)) && userSegmentIdJson) {
        this.userSegmentId = JSON.parse(userSegmentIdJson);
      } else if (!isNaN(Number(cloneUserSegmentIdJson)) && cloneUserSegmentIdJson) {
        this.userSegmentId = JSON.parse(cloneUserSegmentIdJson);
        this.isCloneView = true;
      }

      if (this.userSegmentId != null) {
        if (!this.isCloneView) this.isEditView = true;
        this.getUserSegmentById(this.userSegmentId);
      } else {
        this.showInitialView = true;
      }
    });
  }

  getUserSegmentById(userSegmentId: any) {
    this.commonService.showLoader();
    this.userSegmentService.getUserSegmentById(userSegmentId).subscribe({
      next: (userSegment: any) => {

        this.showInitialView = true;
        this.commonService.hideLoader();
        if (this.isCloneView) {
          delete userSegment.id;
          delete userSegment.status;
          delete userSegment.createdAt;
          delete userSegment.updatedAt;
        }
        this.userSegment = userSegment;
        this.getUserCountByRule()
      },
      error: (err: any) => {
        this.commonService.hideLoader();
        err = err.error?.error || err.error || err;
        this.commonService.toster.error(err.message || 'Failed');
      }
    });
  }

  onSave() {
    try {
      if (!this.userSegment.name || this.userSegment.name.split(' ').join('').length == 0) throw "Please enter Name";
      for (let obj of this.userSegment.rules) {
        for (let data of obj) {
          if (data.attr === 'age' && ((data.cond == 'BETWEEN' && data.end_value < 0 && data.start_value < 0) || (data.cond != 'BETWEEN' && data.value < 0))) throw "Age should be positive"
        }
      }
      this.isValidUserSegmentRule(this.userSegment);
      if (this.isEditView) {
        this.commonService.showLoader();
        this.userSegmentService.updateUserSegmentById(this.userSegmentId, this.userSegment).subscribe({
          next: (e: any) => {
            this.commonService.hideLoader();
            this.commonService.toster.success('User Segment Updated Successfully!');
            this.router.navigate(['/customers/segments']);
          },
          error: (err: any) => {
            this.commonService.hideLoader();
            err = err.error?.error || err.error || err;
            this.commonService.toster.error(err.message || 'User Segment Update Failed');
          }
        });
      } else {
        this.commonService.showLoader();
        this.userSegmentService.createUserSegment(this.userSegment).subscribe({
          next: (e: any) => {
            this.commonService.hideLoader();
            this.commonService.toster.success('User Segment Created Successfully!');
            this.router.navigate(['/customers/segments']);
          },
          error: (err: any) => {
            this.commonService.hideLoader();
            err = err.error?.error || err.error || err;
            this.commonService.toster.error(err.message || 'User Segment Create Failed');
          }
        })
      }
    } catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e);
    }
  }

  getAllAttribute() {
    this.userSegmentService.getAllAttribute().subscribe({
      next: (data: any) => {
        this.listOfTags = data;
      },
      error: (err: any) => {
        err = err.error || err;
      }
    });
  }

  validateForm() {
    this.myForm = new FormGroup({
      name: new FormControl(this.userSegment.name, [Validators.required]),
      age: new FormControl(this.userSegment.age, {
        validators: [Validators.min(0)]
      }),
      ageStart: new FormControl(this.userSegment.age, {
        validators: [Validators.min(0)]
      }),
      ageEnd: new FormControl(this.userSegment.age, {
        validators: [Validators.min(0)]
      })
    });
  }

  addAndCondition(data: any, filterIndex: number) {
    var obj: any = { name: data.name, attr: data.attr, type: data.type };
    if (data.field) {
      obj.field = data.field;
      obj.isPredefiendTag = true;
      this.updateFieldType(obj);
    }
    if (filterIndex == -1) {
      this.userSegment.rules.push([obj]);
    } else {
      this.userSegment.rules[filterIndex].push(obj);
    }
    this.getUserCountByRule();
  }


  isValidUserSegmentRule(userSegment: any) {
    if (userSegment.rules.length > 0) {
      userSegment.rules.forEach((rule: any) => {
        if (rule.length > 0) {
          rule.forEach((obj: any) => {
            switch (obj.type) {
              case "text":
              case "enum":
                if (!obj.cond) throw "Please select condition for the rule. Attribute Name = " + obj.name;
                if (!obj.value) throw "Please enter value for the rule. Attribute Name = " + obj.name;
                break;

              case "tag":
                if (!obj.field) throw "Please select field for the rule. Attribute Name = " + obj.name;
                if (!obj.cond) throw "Please select condition for the rule. Attribute Name = " + obj.name;
                if (obj.cond == 'BETWEEN') {
                  if (!obj.start_value) throw "Please select start value for the rule. Tag Name = " + obj.name;
                  if (!obj.end_value) throw "Please select end value for the rule. Tag Name = " + obj.name;
                } else if (!(obj.cond == 'EXISTS' || obj.value || obj.value !== null)) throw "Please enter value for the rule. Attribute Name = " + obj.name;
                break;

              case "number":
                if (obj.cond == 'BETWEEN') {
                  if ((!obj.start_value) && (typeof (obj.start_value) != 'number')) throw "Please select start value for the rule. Attribute Name = " + obj.name;
                  if ((!obj.end_value) && (typeof (obj.end_value) != 'number')) throw "Please select end value for the rule. Attribute Name = " + obj.name;
                } else {
                  if (!obj.cond) throw "Please select condition for the rule. Attribute Name = " + obj.name;
                  if ((!obj.value) && (typeof (obj.value) != 'number')) throw "Please enter value for the rule. Attribute Name = " + obj.name;
                }
                break;

              case "allUsers":
                break;

              default: throw "Invalid Type";
            }
          });
        } else throw "Please select rule for OR condition";
      });
    } else throw "Please select rule";
    return true;
  }

  createRecommendedUsersegment() {
    this.commonService.showLoader();
    this.userSegmentService.createRecommendedUsersegment({ prompt: this.userSegmentService.selectedRecommendation.description }).subscribe(
      {
        next: (data: any) => {
          this.commonService.hideLoader();
          this.userSegment = data;
          this.getUserCountByRule();
        },
        error: (err: any) => {
          this.commonService.hideLoader();
          err = err.error?.error || err.error || err;
          this.commonService.toster.error(err.message || 'Recommendation error');
        }
      }
    )
  }

  async openSegmentViewPopup() {
    const modal = await this.modalController.create({
      component: SegmentViewPopupComponentComponent,
      cssClass: 'view-user',
      componentProps: {
        usersegementRules: this.userSegment.rules,
        userName: this.userSegment.name
      },
      backdropDismiss: false
    });
    await modal.present();
  }

  getUserCountByRule() {
    try {
      this.showUserloader = true;
      this.isValidUserSegmentRule(this.userSegment);
      this.userCount = null;
      this.userSegmentService.getUserCountByRules(this.userSegment).subscribe({
        next: (data: any) => {
          this.userCount = data.customerCount;
          this.showUserloader = false;
        },
        error: (err: any) => {
          err = (err.error?.error?.message || err.message || err);
          this.commonService.toster.error(err.message);
          this.showUserloader = false;
        }
      });
    } catch (e: any) {
      this.commonService.toster.error(e.error?.error?.message || e.message || e)
    }
  }

  formatDate(date: any) {
  }

  open() {
  }

  removeAndCondition(parIndex: any, currIndex: any) {
    console.log(parIndex, currIndex, this.userSegment.rules.length, 'ewre')
    this.userSegment.rules[parIndex].splice(currIndex, 1);
    if (this.userSegment.rules[parIndex].length == 0) {
      // if (this.showAddFilterIndex != -1 && parIndex != this.showAddFilterIndex
      //   && this.userSegment.rules[this.showAddFilterIndex].length == 0) {
      //   this.userSegment.rules.splice(this.showAddFilterIndex, 1);
      // }
      this.userSegment.rules.splice(parIndex, 1);
      // this.showAddFilterIndex = -1;
    }
    this.getUserCountByRule();
  }

  removeOrCond(index: number) {
    this.userSegment.rules.splice(index, 1);
  }
  addOrCond() {
    this.orFltr = true;
    this.addFltr = false;
    if (this.userSegment.rules.find((rule: any) => rule.length == 0) == null) {
      this.userSegment.rules.push([]);
    }
  }
  async onCancel() {
    this.router.navigateByUrl('/customers/segments');
  }

  updateFieldType(data?: any) {
    data.fieldType = ((this.listOfTags.find((item: any) => item.name === data.field) || {}).type) || "TEXT";
  }
  drop(event: any) {
    if (event.previousContainer === event.container) {
      //moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      copyArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    // if (event.previousContainer.data) {
    //   this.userSegmentDetails = this.userSegmentDetails.filter((f) => !f.temp);
    // }
  }

  dragStarted(event: any) {

  }

  dragEnded(event: any, attr: any) {
    var target = event.event.target;

    if (target.classList.contains("drop-area")) {
      this.addAndCondition(attr, parseInt(target.querySelector("span").innerHTML));
    }

  }

  dragMoved(event: any) {
    // console.log("dragMoved");
  }

  deleteRecommendUsersegment() {
    delete this.userSegmentService.selectedRecommendation.name;
    delete this.userSegmentService.selectedRecommendation.description;
  }
}
