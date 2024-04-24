import { Component } from '@angular/core';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';

import { CommonService } from './service/common.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isMenuCollapse = false;
  expandSelectedMenu: any;
  urlList: any = ['/', '/auth', '/auth/login', '/auth/signup', '/auth/authorize', '/auth/logout', '/auth/reset-password', '/auth/create-password'];

  menuList = [
    {
      title: 'Dashboard',
      link: 'app/dashboard',
      src_outline: './assets/icon/Line Icons/n-dashboard-line.svg',
      src_filled: './assets/icon/Fill Icons/n-dashboard-fill.svg',
    },
    {
      title: 'Reports',
      link: 'app/reports',
      src_outline: './assets/icon/Line Icons/status-line.svg',
      src_filled: './assets/icon/Fill Icons/status-fill.svg',
    },
    {
      title: 'Customers',
      src_outline: './assets/icon/Line Icons/people-line.svg',
      src_filled: './assets/icon/Fill Icons/people-fill.svg',
      isAccordian: true,
      children: [
        {
          title: 'Search',
          link: 'customers/search',
          iconWhiteColor: '../assets/icon/Line Icons/search-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/search-fill.svg',
        },
        {
          title: 'Recently Viewed',
          link: 'customers/recently-viewed',
          iconWhiteColor: '../assets/icon/Line Icons/view-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/view-fill.svg',
        },
        {
          title: 'Segments',
          link: 'customers/segments',
          iconWhiteColor: '../assets/icon/Line Icons/segmnt-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/segmnt-fill.svg',
        }
      ]
    },
    {
      title: 'Notification Center',
      src_outline: '../assets/icon/Line Icons/notification-badge-line.svg',
      src_filled: '../assets/icon/Fill Icons/notification-badge-fill.svg',
      isAccordian: true,
      children: [
        {
          title: 'Create New',
          link: 'notification-center/notification/create',
          iconWhiteColor: '../assets/icon/Line Icons/noti-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/noti-fill.svg',
        },
        {
          title: 'Recently Sent',
          link: 'notification-center/recently-sent',
          iconWhiteColor: '../assets/icon/Line Icons/done-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/done-fill.svg',
        },
        {
          title: 'A/B Test',
          link: 'notification-center/ab-testing',
          iconWhiteColor: '../assets/icon/Line Icons/test-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/test-fill.svg',
        },
        {
          title: 'Queue',
          link: 'notification-center/queue',
          iconWhiteColor: '../assets/icon/Line Icons/queue-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/queue-fill.svg',
        },
        {
          title: 'Categories',
          link: 'notification-center/category',
          iconWhiteColor: '../assets/icon/Line Icons/configCategory-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/configCategory-fill.svg',
        },
        {
          title: 'Templates',
          link: 'notification-center/template',
          iconWhiteColor: '../assets/icon/Line Icons/configTemplate-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/configTemplate-fill.svg',
        },
        {
          title: 'Errors',
          link: 'notification-center/error',
          iconWhiteColor: '../assets/icon/Line Icons/error-warning-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/error-warning-fill.svg',
        }
      ]
    },
    {
      title: 'Data Setup',
      src_outline: '../assets/icon/Line Icons/datasetup-line.svg',
      src_filled: '../assets/icon/Fill Icons/datasetup-fill.svg',
      isAccordian: true,
      children: [
        {
          title: 'Source System',
          link: 'data-setup/source-system',
          iconWhiteColor: '../assets/icon/Line Icons/sourcesystem-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/sourcesystem-fill.svg',
        },
        {
          title: 'Scheduler',
          link: 'data-setup/scheduler',
          iconWhiteColor: '../assets/icon/Line Icons/schedule-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/schedule-fill.svg',
        },
        {
          title: 'Audit Logs',
          link: 'data-setup/audit-log',
          iconWhiteColor: '../assets/icon/Line Icons/audit-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/audit-fill.svg',
        }
      ]
    },
    {
      title: 'User Management',
      src_outline: '../assets/icon/Line Icons/datasetup-line.svg',
      src_filled: '../assets/icon/Fill Icons/datasetup-fill.svg',
      isAccordian: true,
      children: [
        {
          title: 'Users',
          link: 'user-management/users',
          iconWhiteColor: '../assets/icon/Line Icons/sourcesystem-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/sourcesystem-fill.svg',
        },
        {
          title: 'User Groups',
          link: 'user-management/usergroups',
          iconWhiteColor: '../assets/icon/Line Icons/schedule-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/schedule-fill.svg',
        },
        {
          title: 'Role',
          link: 'user-management/role',
          iconWhiteColor: '../assets/icon/Line Icons/audit-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/audit-fill.svg',
        },
        {
          title: 'Permission',
          link: 'user-management/permission',
          iconWhiteColor: '../assets/icon/Line Icons/audit-line.svg',
          iconPrimaryColor: '../assets/icon/Fill Icons/audit-fill.svg',
        }

      ]
    }
  ]
  isOpen = false;
  filteredNames: any = [];

  accordionState: { [key: string]: boolean } = {};

  constructor(public router: Router, private commonService: CommonService) {
    this.menuList.forEach(item => {
      this.accordionState[item.title] = false;
    });
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof RouteConfigLoadStart) {
        this.commonService.showLoader();
      } else if (event instanceof RouteConfigLoadEnd) {
        this.commonService.hideLoader();
      }
    });
    this.updateAccordionGroupValue();
  }

  updateAccordionGroupValue() {
    const currentURL = window.location.href.toLowerCase();
    if (currentURL.includes('customers')) {
      this.expandSelectedMenu = 'Customers';
    } else if (currentURL.includes('notification-center')) {
      this.expandSelectedMenu = 'Notification Center';
    } else if (currentURL.includes('data-setup')) {
      this.expandSelectedMenu = 'Data Setup';
    } else if (currentURL.includes('user-management')) {
      this.expandSelectedMenu = 'User Management';
    }
  }

  isActiveIcon(value?: any) {
    return this.router.url.includes(value) ? true : false;
  }
  toggleAccordion(title: string) {
    this.accordionState[title] = !this.accordionState[title];
  }

  // isAccordionOpen(title: string) {
  //   const data = this.accordionState[title];
  //   console.log(data);
  //   return data;
  // }
}
