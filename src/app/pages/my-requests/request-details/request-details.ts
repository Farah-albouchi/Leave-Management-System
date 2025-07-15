import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-request-details',
  templateUrl: './request-details.html',
  styleUrls: ['./request-details.css'],
  imports:[CommonModule]
})
export class RequestDetails {
  @Input() request: any;
  @Output() close = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  cancelRequest() {
    this.cancel.emit();
  }
  
  closeModal() {
    this.close.emit();
  }
}
