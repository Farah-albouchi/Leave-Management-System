import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCalendar,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faUsers,
  faShield,
  faBuilding,
  faCheckCircle,
  faClock,
  faUserGroup,
  faKey
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  faCalendar = faCalendar;
  faEnvelope = faEnvelope;
  faLock = faLock;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faUsers = faUsers;
  faShield = faShield;
  faBuilding = faBuilding;
  faCheckCircle = faCheckCircle;
  faClock = faClock;
  faUserGroup = faUserGroup;
  faKey=faKey ;

  showPassword = false;
  userType: 'employee' | 'admin' = 'employee';

  toggleUserType(type: 'employee' | 'admin') {
    this.userType = type;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
