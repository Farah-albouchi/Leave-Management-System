import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CalendarA11y, CalendarModule, CalendarMonthViewComponent, CalendarUtils, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarEvent } from 'angular-calendar';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-calendar-leave',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CalendarModule
  ],

  
  templateUrl: './calendar-leave.html',
  styleUrls: ['./calendar-leave.css']
})
export class CalendarLeave {
  currentMonth: Date = new Date();
  calendarDays: any[] = [];
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  leaveDates: { date: Date; type: 'annual' | 'sick' }[] = [
    { date: new Date('2025-07-10'), type: 'sick' },
    { date: new Date('2025-07-15'), type: 'annual' },
  ];
  

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: any[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push({ date: new Date(year, month, i - startDay + 1), isOtherMonth: true });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isOtherMonth: false });
    }

    this.calendarDays = days;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  getLeaveType(date: Date): 'annual' | 'sick' | null {
    const match = this.leaveDates.find(l =>
      l.date.getDate() === date.getDate() &&
      l.date.getMonth() === date.getMonth() &&
      l.date.getFullYear() === date.getFullYear()
    );
    return match?.type || null;
  }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.generateCalendar();
  }
}
