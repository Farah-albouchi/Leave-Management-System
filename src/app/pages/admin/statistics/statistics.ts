import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartType, ChartData, ChartOptions } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faChartLine, 
  faChartBar, 
  faChartPie, 
  faUsers, 
  faCalendarCheck, 
  faArrowUp, 
  faArrowDown,
  faRefresh,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { AdminDashboardSummary } from '../../../models/admin-dashboard.models';
import { AdminStatisticsService, DetailedStatistics, StatisticsData } from '../../../services/admin-statistics.service';





@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FontAwesomeModule],
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.css']
})
export class StatisticsComponent implements OnInit, OnDestroy {
  // Icons
  faChartLine = faChartLine;
  faChartBar = faChartBar;
  faChartPie = faChartPie;
  faUsers = faUsers;
  faCalendarCheck = faCalendarCheck;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faRefresh = faRefresh;
  faDownload = faDownload;

  // Data properties
  statisticsData: StatisticsData | null = null;
  detailedStats: DetailedStatistics | null = null;
  summary: AdminDashboardSummary = {
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalEmployees: 0,
    employeesOnLeaveToday: 0,
    overLimitEmployees: 0
  };

  // State
  isLoading = true;
  errorMessage = '';
  activeTab: 'overview' | 'trends' | 'departments' | 'employees' = 'overview';

  // Chart data
  leaveTypeChart: ChartData<'doughnut'> = { labels: [], datasets: [] };
  monthlyTrendChart: ChartData<'line'> = { labels: [], datasets: [] };
  departmentChart: ChartData<'bar'> = { labels: [], datasets: [] };
  quarterlyChart: ChartData<'bar'> = { labels: [], datasets: [] };

  // Chart options
  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8
      }
    }
  };

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  horizontalBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  private destroy$ = new Subject<void>();

  constructor(
    private statisticsService: AdminStatisticsService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStatistics(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.statisticsService.getCompleteStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.statisticsData = data;
          this.summary = data.summary;
          this.detailedStats = this.statisticsService.calculateDetailedStatistics(data);
          this.initializeCharts();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
          this.errorMessage = 'Failed to load statistics data';
          this.isLoading = false;
        }
      });
  }

  private initializeCharts(): void {
    if (!this.statisticsData) return;

    // Leave Type Distribution Chart
    const leaveTypeData = Object.entries(this.statisticsData.leaveTypeDistribution);
    this.leaveTypeChart = this.statisticsService.generateChartData('doughnut', 
      leaveTypeData.map(([type, count]) => ({ type, count }))
    );

    // Monthly Trend Chart
    this.monthlyTrendChart = this.statisticsService.generateChartData('line', 
      this.statisticsData.monthlyStats
    );

    // Department Chart (if available)
    if (this.statisticsData.departmentStats) {
      this.departmentChart = {
        labels: this.statisticsData.departmentStats.map(d => d.department),
        datasets: [
          {
            label: 'Total Employees',
            data: this.statisticsData.departmentStats.map(d => d.totalEmployees),
            backgroundColor: '#3b82f6',
            borderRadius: 6
          },
          {
            label: 'On Leave',
            data: this.statisticsData.departmentStats.map(d => d.onLeave),
            backgroundColor: '#f59e0b',
            borderRadius: 6
          }
        ]
      };
    }

    // Quarterly Trends Chart
    if (this.statisticsData.quarterlyTrends) {
      this.quarterlyChart = {
        labels: this.statisticsData.quarterlyTrends.map(q => `${q.quarter} ${q.year}`),
        datasets: [
          {
            label: 'Total Requests',
            data: this.statisticsData.quarterlyTrends.map(q => q.totalRequests),
            backgroundColor: '#3b82f6',
            borderRadius: 6
          },
          {
            label: 'Approved',
            data: this.statisticsData.quarterlyTrends.map(q => q.approvedRequests),
            backgroundColor: '#10b981',
            borderRadius: 6
          }
        ]
      };
    }
  }

  // Tab navigation
  setActiveTab(tab: 'overview' | 'trends' | 'departments' | 'employees'): void {
    this.activeTab = tab;
  }

  // Actions
  refreshStatistics(): void {
    this.loadStatistics();
  }

  exportStatistics(): void {
    // Mock export functionality
    const data = {
      summary: this.summary,
      detailedStats: this.detailedStats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leave-statistics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Utility methods
  getPercentage(value: number, total: number): string {
    return this.statisticsService.formatPercentage(value, total);
  }

  getTrendIcon(direction: 'up' | 'down' | 'stable') {
    switch (direction) {
      case 'up': return this.faArrowUp;
      case 'down': return this.faArrowDown;
      default: return this.faChartLine;
    }
  }

  getTrendColor(direction: 'up' | 'down' | 'stable'): string {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getLeaveTypeData(): { type: string; count: number }[] {
    if (!this.statisticsData?.leaveTypeDistribution) return [];
    
    return Object.entries(this.statisticsData.leaveTypeDistribution)
      .map(([type, count]) => ({ type, count: count as number }));
  }

  clearMessages(): void {
    this.errorMessage = '';
  }
}