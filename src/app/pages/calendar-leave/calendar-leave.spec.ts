import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarLeave } from './calendar-leave';

describe('CalendarLeave', () => {
  let component: CalendarLeave;
  let fixture: ComponentFixture<CalendarLeave>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarLeave]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarLeave);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
