import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarA11y, CalendarModule, CalendarMonthViewComponent, CalendarUtils, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarEvent } from 'angular-calendar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService } from '../../services/dashboard.service';
import { LeaveRequestService } from '../../services/leave-request.service';
import { CalendarStateService } from '../../services/calendar-state.service';
import { LeaveRequestResponseDto, LeaveStatus } from '../../models/leave-request.models';
import { LeaveDetailsModal } from '../../components/leave-details-modal/leave-details-modal';

interface CalendarDay {
  date: Date;
  isOtherMonth: boolean;
  leaveRequests: CalendarLeaveRequest[];
  isSelected?: boolean;
  isSelectionStart?: boolean;
  isSelectionEnd?: boolean;
  isInSelectedRange?: boolean;
  hasApprovedLeave?: boolean;
}

interface CalendarLeaveRequest {
  id: string;
  type: string;
  status: LeaveStatus;
  isStart: boolean;
  isEnd: boolean;
  isMiddle: boolean;
  isSingleDay: boolean;
}

@Component({
  selector: 'app-calendar-leave',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CalendarModule,
    LeaveDetailsModal
  ],
  templateUrl: './calendar-leave.html',
  styleUrls: ['./calendar-leave.css']
})
export class CalendarLeave implements OnInit, OnDestroy {
  currentMonth: Date = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  allLeaveRequests: LeaveRequestResponseDto[] = [];
  filteredRequests: LeaveRequestResponseDto[] = [];
  selectedStatusFilter = 'all';
  selectedTypeFilter = 'all';
  
  isLoading = true;
  errorMessage = '';
  conflictMessage = '';

  // Date selection state
  selectionStartDate: Date | null = null;
  isSelectingRange = false;
  selectedLeaveRequest: LeaveRequestResponseDto | null = null;
  showLeaveDetailsModal = false;

  // Make LeaveStatus enum available in template
  LeaveStatus = LeaveStatus;

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private leaveRequestService: LeaveRequestService,
    private calendarStateService: CalendarStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLeaveRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLeaveRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.leaveRequestService.getMyRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests) => {
          this.allLeaveRequests = requests;
          this.applyFilters();
          this.generateCalendar();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading leave requests:', error);
          this.errorMessage = 'Failed to load leave requests';
          this.isLoading = false;
          this.generateCalendar(); // Generate empty calendar
        }
      });
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: CalendarDay[] = [];

    // Previous month days
    for (let i = 0; i < startDay; i++) {
      const date = new Date(year, month, i - startDay + 1);
      days.push({ 
        date, 
        isOtherMonth: true, 
        leaveRequests: this.getLeaveRequestsForDate(date)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ 
        date, 
        isOtherMonth: false, 
        leaveRequests: this.getLeaveRequestsForDate(date)
      });
    }

    // Fill remaining cells for complete weeks
    const remainingCells = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ 
        date, 
        isOtherMonth: true, 
        leaveRequests: this.getLeaveRequestsForDate(date)
      });
    }

    this.calendarDays = days;
    
    // Update selection visual state
    this.updateCalendarSelection();
  }

  private getLeaveRequestsForDate(date: Date): CalendarLeaveRequest[] {
    return this.filteredRequests
      .filter(request => this.isDateInRequest(date, request))
      .map(request => {
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        
        return {
          id: request.id,
          type: request.type,
          status: request.status,
          isStart: this.isSameDate(date, startDate),
          isEnd: this.isSameDate(date, endDate),
          isMiddle: date > startDate && date < endDate,
          isSingleDay: this.isSameDate(startDate, endDate)
        };
      });
  }

  private isDateInRequest(date: Date, request: LeaveRequestResponseDto): boolean {
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    // Set time to beginning of day for accurate comparison
    date.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    return date >= startDate && date <= endDate;
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDate(date, today);
  }

  getStatusClass(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.ACCEPTED:
        return 'bg-green-100 text-green-800 border-green-300';
      case LeaveStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  getTypeClass(type: string): string {
    if (type.toLowerCase().includes('sick')) {
      return 'bg-red-50 border-red-200';
    } else if (type.toLowerCase().includes('annual')) {
      return 'bg-blue-50 border-blue-200';
    } else if (type.toLowerCase().includes('unpaid')) {
      return 'bg-gray-50 border-gray-200';
    }
    return 'bg-purple-50 border-purple-200';
  }

  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.generateCalendar();
  }

  onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatusFilter = target.value;
    this.applyFilters();
    this.generateCalendar();
  }

  onTypeFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedTypeFilter = target.value;
    this.applyFilters();
    this.generateCalendar();
  }

  public applyFilters(): void {
    this.filteredRequests = this.allLeaveRequests.filter(request => {
      const statusMatch = this.selectedStatusFilter === 'all' || 
                         request.status === this.selectedStatusFilter.toUpperCase();
      const typeMatch = this.selectedTypeFilter === 'all' || 
                       request.type === this.selectedTypeFilter;
      
      return statusMatch && typeMatch;
    });
  }

  getUniqueLeaveTypes(): string[] {
    const types = this.allLeaveRequests.map(request => request.type);
    return [...new Set(types)];
  }

  navigateToMyRequests(): void {
    this.router.navigate(['/myRequests']);
  }

  navigateToApplyLeave(): void {
    // Navigate with selected dates if any
    const selectedRange = this.calendarStateService.getSelectedDateRange();
    if (selectedRange.startDate) {
      this.router.navigate(['/ApplyLeave'], {
        state: { 
          prefillDates: {
            startDate: selectedRange.startDate,
            endDate: selectedRange.endDate || selectedRange.startDate
          }
        }
      });
    } else {
      this.router.navigate(['/ApplyLeave']);
    }
  }

  onDateClick(day: CalendarDay, event?: MouseEvent): void {
    // Prevent default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // If clicking on a day with approved leave, show details modal
    const approvedLeave = day.leaveRequests.find(req => req.status === LeaveStatus.ACCEPTED);
    if (approvedLeave) {
      // Find the full leave request details using the ID
      const fullRequest = this.allLeaveRequests.find(req => req.id === approvedLeave.id);
      if (fullRequest) {
        this.showLeaveDetails(fullRequest);
      }
      return;
    }

    // Skip other month days for selection
    if (day.isOtherMonth) {
      return;
    }

    // Handle date selection for creating new requests
    this.handleDateSelection(day.date, event);
  }

  private handleDateSelection(selectedDate: Date, event?: MouseEvent): void {
    const isShiftKey = event?.shiftKey || false;
    const normalizedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    if (!this.selectionStartDate || !isShiftKey) {
      // Start new selection
      this.selectionStartDate = normalizedDate;
      this.isSelectingRange = false;
      this.conflictMessage = '';
      this.calendarStateService.setSelectedDateRange(normalizedDate);
    } else {
      // Complete range selection
      const startDate = this.selectionStartDate;
      const endDate = normalizedDate;
      
      // Ensure start date is before end date
      const actualStartDate = startDate <= endDate ? startDate : endDate;
      const actualEndDate = startDate <= endDate ? endDate : startDate;
      
      // Check for conflicts with approved leave
      if (this.hasConflictWithApprovedLeave(actualStartDate, actualEndDate)) {
        this.conflictMessage = 'Selected dates conflict with existing approved leave. Please choose different dates.';
        return;
      }
      
      this.isSelectingRange = true;
      this.conflictMessage = '';
      this.calendarStateService.setSelectedDateRange(actualStartDate, actualEndDate);
    }

    // Update calendar display
    this.updateCalendarSelection();
  }

  private hasConflictWithApprovedLeave(startDate: Date, endDate: Date): boolean {
    const approvedRequests = this.allLeaveRequests.filter(req => req.status === LeaveStatus.ACCEPTED);
    
    return approvedRequests.some(request => {
      const requestStart = new Date(request.startDate);
      const requestEnd = new Date(request.endDate);
      
      // Normalize dates for comparison
      const reqStartNorm = new Date(requestStart.getFullYear(), requestStart.getMonth(), requestStart.getDate());
      const reqEndNorm = new Date(requestEnd.getFullYear(), requestEnd.getMonth(), requestEnd.getDate());
      
      // Check for overlap
      return (startDate <= reqEndNorm && endDate >= reqStartNorm);
    });
  }

  private updateCalendarSelection(): void {
    this.calendarDays.forEach(day => {
      day.isSelected = this.calendarStateService.isDateInSelectedRange(day.date);
      day.isInSelectedRange = day.isSelected;
      
      if (this.selectionStartDate) {
        const dayTime = day.date.getTime();
        const startTime = this.selectionStartDate.getTime();
        day.isSelectionStart = dayTime === startTime;
        
        if (this.isSelectingRange) {
          const selectedRange = this.calendarStateService.getSelectedDateRange();
          if (selectedRange.endDate) {
            const endTime = selectedRange.endDate.getTime();
            day.isSelectionEnd = dayTime === endTime;
          }
        }
      }
    });
  }

  showLeaveDetails(leaveRequest: LeaveRequestResponseDto): void {
    this.selectedLeaveRequest = leaveRequest;
    this.showLeaveDetailsModal = true;
  }

  closeLeaveDetailsModal(): void {
    this.showLeaveDetailsModal = false;
    this.selectedLeaveRequest = null;
  }

  clearSelection(): void {
    this.selectionStartDate = null;
    this.isSelectingRange = false;
    this.conflictMessage = '';
    this.calendarStateService.clearSelectedDateRange();
    this.updateCalendarSelection();
  }

  getSelectedDateRangeText(): string {
    return this.calendarStateService.getFormattedDateRange();
  }

  refreshCalendar(): void {
    this.loadLeaveRequests();
  }

  // Helper methods for template calculations
  getApprovedRequestsCount(): number {
    return this.allLeaveRequests.filter(r => r.status === LeaveStatus.ACCEPTED).length;
  }

  getPendingRequestsCount(): number {
    return this.allLeaveRequests.filter(r => r.status === LeaveStatus.PENDING).length;
  }

  getRejectedRequestsCount(): number {
    return this.allLeaveRequests.filter(r => r.status === LeaveStatus.REJECTED).length;
  }

  getTotalRequestsCount(): number {
    return this.allLeaveRequests.length;
  }
}
