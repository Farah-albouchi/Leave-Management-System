import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HolidayService } from '../../../services/holiday.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Holiday {
  date: Date;
  name: string;
}

@Component({
  selector: 'app-holiday',
  standalone: true,
  imports: [CommonModule, DatePipe,HttpClientModule],
  templateUrl: './holidays.html',
  styleUrls: ['./holidays.css'],
})
export class HolidaysComponent implements OnInit {
  holidayDates: { date: Date; name: string }[] = [];

  constructor(private holidayService: HolidayService,private http: HttpClient) {}

 
  currentMonth: Date = new Date();
  calendarDays: { date: Date; isOtherMonth: boolean }[] = [];
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  holidayList: Holiday[] = [
    { date: new Date('2025-01-01'), name: 'New Year’s Day' },
    { date: new Date('2025-05-01'), name: 'Labor Day' },
    { date: new Date('2025-07-25'), name: 'Republic Day' },
    { date: new Date('2025-12-25'), name: 'Christmas Day' },
  ];

  ngOnInit() {
    this.holidayService.getLocalHolidays().subscribe({
      next: holidays => {
        this.holidayDates = holidays;
        this.generateCalendar();
      },
      error: err => console.error('Error loading local holidays:', err)
    });
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

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.generateCalendar();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  isHoliday(date: Date): { date: Date; name: string } | null {
    return (
      this.holidayDates.find(
        h =>
          h.date.getDate() === date.getDate() &&
          h.date.getMonth() === date.getMonth() &&
          h.date.getFullYear() === date.getFullYear()
      ) || null
    );
  }
  
  get upcomingHolidays() {
    const today = new Date();
    return this.holidayDates
      .filter(h => h.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }
  
 
}
