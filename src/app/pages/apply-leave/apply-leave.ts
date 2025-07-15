import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-apply-leave',
  imports: [CommonModule, FormsModule],
  templateUrl: './apply-leave.html',
  styleUrls: ['./apply-leave.css'],
})
export class ApplyLeave {
  leaveTypes = ['Annual Leave', 'Sick Leave', 'Unpaid Leave'];
  form = {
    type: '',
    startDate: '',
    endDate: '',
    halfDay: false,
    reason: '',
    document: null as File | null,
    days: 0,
  };

  onDateChange() {
    if (this.form.startDate && this.form.endDate) {
      const start = new Date(this.form.startDate);
      const end = new Date(this.form.endDate);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
      this.form.days = diff > 0 ? diff - (this.form.halfDay ? 0.5 : 0) : 0;
    } else {
      this.form.days = 0;
    }
  }

  onHalfDayToggle() {
    this.onDateChange(); // Recalculate days
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.document = file;
    }
  }

  onSubmit() {
    console.log('Leave Request:', this.form);
    alert('Leave request submitted!');
  }
}
