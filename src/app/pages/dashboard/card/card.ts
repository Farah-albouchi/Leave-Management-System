import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'app-card',
  imports: [FontAwesomeModule , CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class Card {
  @Input() title = '';
  @Input() value = '';
  @Input() subtitle = '';
  @Input() icon: any;
  @Input() bgColor = 'bg-gray-100';
  @Input() iconColor = 'text-gray-500';
}
