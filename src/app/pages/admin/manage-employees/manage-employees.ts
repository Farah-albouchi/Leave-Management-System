import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-employees',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule , FormsModule , RouterModule],
  templateUrl: './manage-employees.html',
  styleUrls: ['./manage-employees.css']
})
export class ManageEmployees {
  faUser = faUser;
  faEye = faEye;

  employees = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah.j@example.com', department: 'Engineering', role: 'Employee', status: 'Active' },
    { id: 2, name: 'Mike Chen', email: 'mike.chen@example.com', department: 'Marketing', role: 'Employee', status: 'Active' },
    { id: 3, name: 'Emma Davis', email: 'emma.d@example.com', department: 'Sales', role: 'Manager', status: 'Pending' }
  ];
  
  searchText = '';
  filterRole = '';
  filterStatus = '';

  // Filtering method
  filteredEmployees() {
    return this.employees.filter(emp =>
      emp.name.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.filterRole ? emp.role === this.filterRole : true) &&
      (this.filterStatus ? emp.status === this.filterStatus : true)
    );
  }
  showAddModal = false;

newEmployee = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  cin: null,
  address: '',
  role: 'EMPLOYEE',
  status: 'Active',
};

openAddModal() {
  this.newEmployee = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cin: null,
    address: '',
    role: 'EMPLOYEE',
    status: 'Active',
  };
  this.showAddModal = true;
}

closeAddModal() {
  this.showAddModal = false;
}

addEmployee() {
  console.log('New Employee:', this.newEmployee);
  // Backend integration here
  this.closeAddModal();
}

}
