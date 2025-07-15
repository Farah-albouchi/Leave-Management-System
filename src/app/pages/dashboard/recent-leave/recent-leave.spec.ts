import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentLeave } from './recent-leave';

describe('RecentLeave', () => {
  let component: RecentLeave;
  let fixture: ComponentFixture<RecentLeave>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentLeave]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentLeave);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
