import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  AdminDashboardSummary, 
  MonthlyLeaveStat, 
  LeaveTypeDistribution 
} from '../models/admin-dashboard.models';

export interface StatisticsData {
  summary: AdminDashboardSummary;
  monthlyStats: MonthlyLeaveStat[];
  leaveTypeDistribution: LeaveTypeDistribution;
  departmentStats?: DepartmentStat[];
  employeeUtilization?: EmployeeUtilization[];
  quarterlyTrends?: QuarterlyTrend[];
}

export interface DepartmentStat {
  department: string;
  totalEmployees: number;
  onLeave: number;
  utilizationRate: number;
}

export interface EmployeeUtilization {
  employeeId: string;
  employeeName: string;
  totalDaysUsed: number;
  totalDaysAvailable: number;
  utilizationPercentage: number;
}

export interface QuarterlyTrend {
  quarter: string;
  year: number;
  totalRequests: number;
  approvedRequests: number;
  averageApprovalTime: number;
}

export interface DetailedStatistics {
  peakLeaveMonths: string[];
  mostCommonLeaveType: string;
  averageLeaveLength: number;
  totalLeaveDays: number;
  approvalRate: number;
  pendingBacklog: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStatisticsService {
  private readonly API_URL = 'http://localhost:8080/api/admin';
  
  // Subject to track statistics data updates
  private statisticsDataSubject = new BehaviorSubject<StatisticsData | null>(null);
  public statisticsData$ = this.statisticsDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get complete statistics data
   */
  getCompleteStatistics(): Observable<StatisticsData> {
    return forkJoin({
      summary: this.getDashboardSummary(),
      monthlyStats: this.getMonthlyStats(),
      leaveTypeDistribution: this.getLeaveTypeDistribution()
    }).pipe(
      map(data => ({
        summary: data.summary,
        monthlyStats: data.monthlyStats,
        leaveTypeDistribution: data.leaveTypeDistribution,
        departmentStats: this.generateMockDepartmentStats(),
        employeeUtilization: this.generateMockEmployeeUtilization(),
        quarterlyTrends: this.generateMockQuarterlyTrends()
      })),
      tap(statisticsData => this.statisticsDataSubject.next(statisticsData)),
      catchError(this.handleError)
    );
  }

  /**
   * Get dashboard summary statistics
   */
  getDashboardSummary(): Observable<AdminDashboardSummary> {
    return this.http.get<AdminDashboardSummary>(`${this.API_URL}/stats/summary`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get monthly leave statistics
   */
  getMonthlyStats(): Observable<MonthlyLeaveStat[]> {
    return this.http.get<MonthlyLeaveStat[]>(`${this.API_URL}/stats/monthly-trend`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get leave type distribution
   */
  getLeaveTypeDistribution(): Observable<LeaveTypeDistribution> {
    return this.http.get<LeaveTypeDistribution>(`${this.API_URL}/stats/leave-types`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get employee statistics
   */
  getEmployeeStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/employees/stats`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get request statistics
   */
  getRequestStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/requests/stats`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Calculate detailed statistics from raw data
   */
  calculateDetailedStatistics(data: StatisticsData): DetailedStatistics {
    const { summary, monthlyStats, leaveTypeDistribution } = data;
    
    // Find peak leave months
    const sortedMonths = monthlyStats
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 3)
      .map(stat => stat.month);
    
    // Find most common leave type
    const leaveTypes = Object.entries(leaveTypeDistribution);
    const mostCommon = leaveTypes.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    // Calculate approval rate
    const approvalRate = summary.totalRequests > 0 
      ? (summary.approvedRequests / summary.totalRequests) * 100 
      : 0;
    
    return {
      peakLeaveMonths: sortedMonths,
      mostCommonLeaveType: mostCommon[0],
      averageLeaveLength: 2.5, // Mock data - would be calculated from actual requests
      totalLeaveDays: summary.approvedRequests * 2.5, // Mock calculation
      approvalRate: Math.round(approvalRate),
      pendingBacklog: summary.pendingRequests
    };
  }

  /**
   * Get chart colors for different chart types
   */
  getChartColors(type: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'): string[] {
    const colorSets = {
      primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
      secondary: ['#6b7280', '#4b5563', '#374151', '#1f2937'],
      success: ['#10b981', '#059669', '#047857', '#065f46'],
      warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
      danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
      info: ['#06b6d4', '#0891b2', '#0e7490', '#155e75']
    };
    return colorSets[type];
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value: number, total: number): string {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  }

  /**
   * Format month name from various formats
   */
  formatMonthName(monthString: string): string {
    // Handle different month formats that might come from backend
    const date = new Date(monthString + ' 1, 2024');
    if (isNaN(date.getTime())) {
      return monthString; // Return as-is if can't parse
    }
    return date.toLocaleDateString('en-US', { month: 'short' });
  }

  /**
   * Get trend direction and percentage change
   */
  getTrendAnalysis(currentValue: number, previousValue: number): { direction: 'up' | 'down' | 'stable'; percentage: number } {
    if (previousValue === 0) {
      return { direction: 'stable', percentage: 0 };
    }
    
    const change = ((currentValue - previousValue) / previousValue) * 100;
    
    if (Math.abs(change) < 5) {
      return { direction: 'stable', percentage: Math.abs(change) };
    }
    
    return {
      direction: change > 0 ? 'up' : 'down',
      percentage: Math.abs(change)
    };
  }

  /**
   * Generate chart data for different visualization types
   */
  generateChartData(type: 'line' | 'bar' | 'doughnut' | 'radar', data: any[]): any {
    switch (type) {
      case 'line':
        return {
          labels: data.map(item => this.formatMonthName(item.month || item.label)),
          datasets: [{
            label: 'Leave Requests',
            data: data.map(item => item.requestCount || item.value),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }]
        };
      
      case 'bar':
        return {
          labels: data.map(item => item.type || item.label),
          datasets: [{
            label: 'Count',
            data: data.map(item => item.count || item.value),
            backgroundColor: this.getChartColors('primary'),
            borderRadius: 6,
            borderSkipped: false
          }]
        };
      
      case 'doughnut':
        return {
          labels: data.map(item => item.type || item.label),
          datasets: [{
            data: data.map(item => item.count || item.value),
            backgroundColor: this.getChartColors('primary'),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        };
      
      case 'radar':
        return {
          labels: data.map(item => item.label),
          datasets: [{
            label: 'Performance',
            data: data.map(item => item.value),
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3b82f6',
            pointBackgroundColor: '#3b82f6'
          }]
        };
      
      default:
        return { labels: [], datasets: [] };
    }
  }

  /**
   * Refresh statistics data
   */
  refreshStatistics(): void {
    this.getCompleteStatistics().subscribe();
  }

  /**
   * Get current statistics data
   */
  getCurrentStatistics(): StatisticsData | null {
    return this.statisticsDataSubject.value;
  }

  /**
   * Generate mock department statistics (would be replaced with real API)
   */
  private generateMockDepartmentStats(): DepartmentStat[] {
    return [
      { department: 'Engineering', totalEmployees: 25, onLeave: 3, utilizationRate: 85 },
      { department: 'Marketing', totalEmployees: 15, onLeave: 2, utilizationRate: 70 },
      { department: 'Sales', totalEmployees: 20, onLeave: 1, utilizationRate: 60 },
      { department: 'HR', totalEmployees: 8, onLeave: 0, utilizationRate: 40 }
    ];
  }

  /**
   * Generate mock employee utilization (would be replaced with real API)
   */
  private generateMockEmployeeUtilization(): EmployeeUtilization[] {
    return [
      { employeeId: '1', employeeName: 'John Doe', totalDaysUsed: 18, totalDaysAvailable: 25, utilizationPercentage: 72 },
      { employeeId: '2', employeeName: 'Jane Smith', totalDaysUsed: 15, totalDaysAvailable: 25, utilizationPercentage: 60 },
      { employeeId: '3', employeeName: 'Bob Johnson', totalDaysUsed: 22, totalDaysAvailable: 25, utilizationPercentage: 88 }
    ];
  }

  /**
   * Generate mock quarterly trends (would be replaced with real API)
   */
  private generateMockQuarterlyTrends(): QuarterlyTrend[] {
    return [
      { quarter: 'Q1', year: 2024, totalRequests: 45, approvedRequests: 40, averageApprovalTime: 2.5 },
      { quarter: 'Q2', year: 2024, totalRequests: 52, approvedRequests: 48, averageApprovalTime: 2.2 },
      { quarter: 'Q3', year: 2024, totalRequests: 38, approvedRequests: 35, averageApprovalTime: 3.1 },
      { quarter: 'Q4', year: 2024, totalRequests: 41, approvedRequests: 37, averageApprovalTime: 2.8 }
    ];
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('AdminStatisticsService error:', error);
    
    let errorMessage = 'An error occurred while fetching statistics data';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => ({ message: errorMessage, error }));
  }
}