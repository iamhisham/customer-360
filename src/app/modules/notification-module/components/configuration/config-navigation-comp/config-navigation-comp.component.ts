import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/modules/notification-module/services/notification.service';

@Component({
  selector: 'app-config-navigation-comp',
  templateUrl: './config-navigation-comp.component.html',
  styleUrls: ['./config-navigation-comp.component.scss'],
})
export class ConfigNavigationCompComponent implements OnInit {
  @Input() activeMenu: string = '';

  constructor(public notifiService: NotificationService, private router: Router,) { }

  ngOnInit() { }

  navigateByUrl(url: any) {
    this.router.navigate([url])
  }
}
