import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { Navbar } from '../components/navbar/navbar';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, Navbar],
  templateUrl: './main-layout-component.html',
  styleUrls: ['./main-layout-component.css'],
})
export class MainLayoutComponent {
  isSidebarCollapsed = false;
  role: 'admin' | 'employee' = 'admin'; // Later read from JWT

  onSidebarToggle() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
