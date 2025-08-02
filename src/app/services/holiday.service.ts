import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

export interface Holiday {
  name: string;
  date: Date;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class HolidayService {
  constructor(private http: HttpClient) {}

  getLocalHolidays() {
    return this.http.get<any[]>('/holidays-tn-2025.json').pipe(
      map(list => list.map(h => ({
        name: h.name,
        date: new Date(h.date),
        type: h.type
      })))
    );
  }
}
