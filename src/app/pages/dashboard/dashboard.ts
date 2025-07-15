import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Card } from './card/card';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import {  faCalendar , faClock , faClipboard , faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { RecentLeave } from './recent-leave/recent-leave';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FontAwesomeModule,Card,RecentLeave],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  faPlus = faPlus;
  faCalendar = faCalendar;
  faClock = faClock;
  faClipboard = faClipboard;
  faCheckCircle = faCheckCircle;
}
