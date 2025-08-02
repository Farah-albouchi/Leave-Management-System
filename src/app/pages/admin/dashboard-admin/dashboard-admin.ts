import { Component } from '@angular/core';
import { Card } from '../../../components/card/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {  faCalendar , faClock , faClipboard , faCheckCircle ,faRectangleXmark , faChartBar , faUser } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-admin',
  imports: [CommonModule, FontAwesomeModule,Card],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css'
})
export class DashboardAdmin {
  faPlus = faPlus;
  faCalendar = faCalendar;
  faClock = faClock;
  faClipboard = faClipboard;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faRectangleXmark  ; 
  faChartLine = faChartBar ; 
  faUsers = faUser ; 
  
}
