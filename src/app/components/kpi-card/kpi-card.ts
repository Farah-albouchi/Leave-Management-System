import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { KpiCardData } from '../../models/enhanced-leave-balance.models';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.css'
})
export class KpiCard {
  @Input() data!: KpiCardData;
  @Input() isLoading = false;

  getCardClasses(): string {
    const baseClasses = 'relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md';
    
    if (this.isLoading) {
      return `${baseClasses} opacity-50`;
    }
    
    return baseClasses;
  }

  getIconClasses(): string {
    const baseClasses = 'text-2xl';
    
    switch (this.data.color) {
      case 'blue':
        return `${baseClasses} text-blue-600`;
      case 'green':
        return `${baseClasses} text-green-600`;
      case 'yellow':
        return `${baseClasses} text-yellow-600`;
      case 'red':
        return `${baseClasses} text-red-600`;
      case 'purple':
        return `${baseClasses} text-purple-600`;
      case 'gray':
        return `${baseClasses} text-gray-600`;
      default:
        return `${baseClasses} text-blue-600`;
    }
  }

  getValueClasses(): string {
    const baseClasses = 'text-3xl font-bold';
    
    switch (this.data.color) {
      case 'blue':
        return `${baseClasses} text-blue-900`;
      case 'green':
        return `${baseClasses} text-green-900`;
      case 'yellow':
        return `${baseClasses} text-yellow-900`;
      case 'red':
        return `${baseClasses} text-red-900`;
      case 'purple':
        return `${baseClasses} text-purple-900`;
      case 'gray':
        return `${baseClasses} text-gray-900`;
      default:
        return `${baseClasses} text-blue-900`;
    }
  }

  getTrendClasses(): string {
    if (!this.data.trend) return '';
    
    const baseClasses = 'flex items-center space-x-1 text-sm font-medium';
    
    switch (this.data.trend.direction) {
      case 'up':
        return `${baseClasses} text-green-600`;
      case 'down':
        return `${baseClasses} text-red-600`;
      case 'neutral':
        return `${baseClasses} text-gray-600`;
      default:
        return `${baseClasses} text-gray-600`;
    }
  }

  getTrendIcon(): string {
    if (!this.data.trend) return '';
    
    switch (this.data.trend.direction) {
      case 'up':
        return 'fas fa-arrow-up';
      case 'down':
        return 'fas fa-arrow-down';
      case 'neutral':
        return 'fas fa-minus';
      default:
        return '';
    }
  }
}


