import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarComponent } from './components/sidebar/sidebar';
import { Navbar } from './components/navbar/navbar';
import { Dashboard } from './pages/dashboard/dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,         
    SidebarComponent  ,  
    FontAwesomeModule, 
    Navbar,
    Dashboard
    
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // isSidebarCollapsed = false;
  // role: 'admin' | 'employee' = 'admin';

  // onSidebarToggle() {
  //   this.isSidebarCollapsed = !this.isSidebarCollapsed;
  // }
}
