import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  faCalendarAlt,
  faUser,
  faBuilding,
  faTag,
  faFilter,
  faTimes,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { StatisticsFilters } from '../../models/statistics.models';

@Component({
  selector: 'app-statistics-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './statistics-filters.html',
  styleUrls: ['./statistics-filters.css']
})
export class StatisticsFiltersComponent implements OnInit, OnDestroy {
  @Input() loading = false;
  @Output() filtersChange = new EventEmitter<StatisticsFilters>();

  // Icons
  faCalendarAlt = faCalendarAlt;
  faUser = faUser;
  faBuilding = faBuilding;
  faTag = faTag;
  faFilter = faFilter;
  faTimes = faTimes;
  faSearch = faSearch;

  filtersForm!: FormGroup;
  isExpanded = false;
  hasActiveFilters = false;

  // Options for dropdowns
  leaveTypes = [
    { value: '', label: 'All Leave Types' },
    { value: 'VACATION', label: 'Vacation' },
    { value: 'SICK', label: 'Sick Leave' },
    { value: 'MATERNITY', label: 'Maternity Leave' },
    { value: 'UNPAID', label: 'Unpaid Leave' }
  ];

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  departments = [
    { value: '', label: 'All Departments' },
    { value: 'IT', label: 'Information Technology' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Operations', label: 'Operations' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadFiltersFromUrl();
    this.setupFormSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    // Get current date for default range (last 3 months)
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    this.filtersForm = this.fb.group({
      dateFrom: [''],
      dateTo: [''],
      employeeId: [''],
      department: [''],
      leaveType: [''],
      status: ['']
    });
  }

  private setupFormSubscription(): void {
    this.filtersForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(filters => {
        this.hasActiveFilters = this.checkHasActiveFilters(filters);
        this.updateUrlParams(filters);
        this.filtersChange.emit(this.cleanFilters(filters));
      });
  }

  private loadFiltersFromUrl(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const filters = {
          dateFrom: params['dateFrom'] || '',
          dateTo: params['dateTo'] || '',
          employeeId: params['employeeId'] || '',
          department: params['department'] || '',
          leaveType: params['leaveType'] || '',
          status: params['status'] || ''
        };

        this.filtersForm.patchValue(filters, { emitEvent: false });
        this.hasActiveFilters = this.checkHasActiveFilters(filters);
        
        // Emit initial filters
        setTimeout(() => {
          this.filtersChange.emit(this.cleanFilters(filters));
        });
      });
  }

  private updateUrlParams(filters: StatisticsFilters): void {
    const queryParams = this.cleanFilters(filters);
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private cleanFilters(filters: StatisticsFilters): StatisticsFilters {
    const cleaned: StatisticsFilters = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.toString().trim()) {
        cleaned[key as keyof StatisticsFilters] = value.toString().trim();
      }
    });
    
    return cleaned;
  }

  private checkHasActiveFilters(filters: StatisticsFilters): boolean {
    return Object.values(filters).some(value => value && value.toString().trim());
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  clearAllFilters(): void {
    this.filtersForm.reset();
    this.isExpanded = false;
  }

  applyQuickFilter(type: 'lastMonth' | 'last3Months' | 'thisYear' | 'pending' | 'approved'): void {
    const today = new Date();
    const currentFilters = this.filtersForm.value;

    switch (type) {
      case 'lastMonth':
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        this.filtersForm.patchValue({
          ...currentFilters,
          dateFrom: this.formatDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)),
          dateTo: this.formatDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0))
        });
        break;

      case 'last3Months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        this.filtersForm.patchValue({
          ...currentFilters,
          dateFrom: this.formatDate(threeMonthsAgo),
          dateTo: this.formatDate(today)
        });
        break;

      case 'thisYear':
        this.filtersForm.patchValue({
          ...currentFilters,
          dateFrom: this.formatDate(new Date(today.getFullYear(), 0, 1)),
          dateTo: this.formatDate(today)
        });
        break;

      case 'pending':
        this.filtersForm.patchValue({
          ...currentFilters,
          status: 'PENDING'
        });
        break;

      case 'approved':
        this.filtersForm.patchValue({
          ...currentFilters,
          status: 'APPROVED'
        });
        break;
    }

    this.isExpanded = false;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getActiveFiltersCount(): number {
    const filters = this.filtersForm.value;
    return Object.values(filters).filter(value => value && value.toString().trim()).length;
  }

  getActiveFiltersText(): string {
    const filters = this.filtersForm.value;
    const active: string[] = [];

    if (filters.dateFrom && filters.dateTo) {
      active.push(`${filters.dateFrom} to ${filters.dateTo}`);
    } else if (filters.dateFrom) {
      active.push(`From ${filters.dateFrom}`);
    } else if (filters.dateTo) {
      active.push(`Until ${filters.dateTo}`);
    }

    if (filters.leaveType) {
      const leaveType = this.leaveTypes.find(t => t.value === filters.leaveType);
      active.push(leaveType?.label || filters.leaveType);
    }

    if (filters.status) {
      const status = this.statusOptions.find(s => s.value === filters.status);
      active.push(status?.label || filters.status);
    }

    if (filters.department) {
      const dept = this.departments.find(d => d.value === filters.department);
      active.push(dept?.label || filters.department);
    }

    return active.length > 0 ? active.join(', ') : 'No filters applied';
  }
}
