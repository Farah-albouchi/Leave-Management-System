import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar-leave',
  imports: [DatePipe,CommonModule],
  templateUrl: './calendar-leave.html',
  styleUrl: './calendar-leave.css'
})
export class CalendarLeave implements OnInit {
  currentMonth: Date = new Date();
  calendarDays: any[] = [];
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  leaveDates = [
    new Date('2024-01-15'),
    new Date('2024-01-16'),
    new Date('2024-01-17'),
    new Date('2024-01-18'),
    new Date('2024-01-19'),
    new Date('2024-02-05'),
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

    // Fill previous month blanks
    for (let i = 0; i < startDay; i++) {
      const d = new Date(year, month, i - startDay + 1);
      days.push({ date: d, isOtherMonth: true });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isOtherMonth: false });
    }

    this.calendarDays = days;
  }

  isLeaveDay(day: any): boolean {
    return this.leaveDates.some(
      (leave) =>
        leave.getDate() === day.date.getDate() &&
        leave.getMonth() === day.date.getMonth() &&
        leave.getFullYear() === day.date.getFullYear()
    );
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
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
