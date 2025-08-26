import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SelectedDateRange {
  startDate: Date | null;
  endDate: Date | null;
  isRangeSelection: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarStateService {
  private selectedDateRangeSubject = new BehaviorSubject<SelectedDateRange>({
    startDate: null,
    endDate: null,
    isRangeSelection: false
  });

  public selectedDateRange$ = this.selectedDateRangeSubject.asObservable();

  constructor() {}

  /**
   * Set selected date range from calendar
   */
  setSelectedDateRange(startDate: Date | null, endDate: Date | null = null): void {
    const dateRange: SelectedDateRange = {
      startDate,
      endDate: endDate || startDate,
      isRangeSelection: !!endDate && endDate !== startDate
    };
    
    this.selectedDateRangeSubject.next(dateRange);
  }

  /**
   * Get current selected date range
   */
  getSelectedDateRange(): SelectedDateRange {
    return this.selectedDateRangeSubject.value;
  }

  /**
   * Clear selected date range
   */
  clearSelectedDateRange(): void {
    this.selectedDateRangeSubject.next({
      startDate: null,
      endDate: null,
      isRangeSelection: false
    });
  }

  /**
   * Check if a date is within the selected range
   */
  isDateInSelectedRange(date: Date): boolean {
    const selectedRange = this.getSelectedDateRange();
    
    if (!selectedRange.startDate) {
      return false;
    }

    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startDate = new Date(selectedRange.startDate.getFullYear(), selectedRange.startDate.getMonth(), selectedRange.startDate.getDate());
    const endDate = selectedRange.endDate 
      ? new Date(selectedRange.endDate.getFullYear(), selectedRange.endDate.getMonth(), selectedRange.endDate.getDate())
      : startDate;

    return checkDate >= startDate && checkDate <= endDate;
  }

  /**
   * Format date range for display
   */
  getFormattedDateRange(): string {
    const selectedRange = this.getSelectedDateRange();
    
    if (!selectedRange.startDate) {
      return '';
    }

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    if (!selectedRange.endDate || selectedRange.startDate.getTime() === selectedRange.endDate.getTime()) {
      return formatDate(selectedRange.startDate);
    }

    return `${formatDate(selectedRange.startDate)} - ${formatDate(selectedRange.endDate)}`;
  }
}



