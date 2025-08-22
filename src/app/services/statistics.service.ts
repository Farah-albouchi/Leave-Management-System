import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { 
  StatisticsKPIs, 
  StatisticsFilters, 
  MonthlyTrendData, 
  LeaveTypeDistribution, 
  StatusDistribution, 
  TopEmployeeData, 
  RecentRequestData, 
  EmployeeBalanceData, 
  StatisticsData,
  ExportOptions
} from '../models/statistics.models';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly API_URL = 'http://localhost:8080/api/admin/stats';
  
  private filtersSubject = new BehaviorSubject<StatisticsFilters>({});
  private statisticsDataSubject = new BehaviorSubject<StatisticsData | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public filters$ = this.filtersSubject.asObservable();
  public statisticsData$ = this.statisticsDataSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load comprehensive statistics data
   */
  loadStatistics(filters: StatisticsFilters = {}): Observable<StatisticsData> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.filtersSubject.next(filters);

    const params = this.buildHttpParams(filters);

    return forkJoin({
      kpis: this.getKPIs(params),
      monthlyTrend: this.getMonthlyTrend(params),
      leaveTypeDistribution: this.getLeaveTypeDistribution(params),
      statusDistribution: this.getStatusDistribution(params),
      topEmployees: this.getTopEmployees(params),
      recentRequests: this.getRecentRequests(params),
      employeeBalances: this.getEmployeeBalances(params)
    }).pipe(
      map(data => {
        const statisticsData: StatisticsData = {
          kpis: data.kpis,
          monthlyTrend: data.monthlyTrend,
          leaveTypeDistribution: data.leaveTypeDistribution,
          statusDistribution: data.statusDistribution,
          topEmployees: data.topEmployees,
          recentRequests: data.recentRequests,
          employeeBalances: data.employeeBalances
        };
        
        this.statisticsDataSubject.next(statisticsData);
        this.loadingSubject.next(false);
        return statisticsData;
      }),
      catchError(error => {
        console.error('Error loading statistics:', error);
        this.errorSubject.next('Failed to load statistics data');
        this.loadingSubject.next(false);
        return of(this.getEmptyStatisticsData());
      }),
      shareReplay(1)
    );
  }

  /**
   * Get KPI metrics
   */
  private getKPIs(params: HttpParams): Observable<StatisticsKPIs> {
    return this.http.get<any>(`${this.API_URL}/summary`, { params }).pipe(
      map(data => {
        const total = data.totalRequests || 0;
        const approved = data.approvedRequests || 0;
        const rejected = data.rejectedRequests || 0;
        const pending = data.pendingRequests || 0;
        
        return {
          totalRequests: total,
          approvedRequests: approved,
          rejectedRequests: rejected,
          pendingRequests: pending,
          approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
          avgApprovalTime: data.avgApprovalTime || 0
        };
      }),
      catchError(() => of({
        totalRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        pendingRequests: 0,
        approvalRate: 0,
        avgApprovalTime: 0
      }))
    );
  }

  /**
   * Get monthly trend data
   */
  private getMonthlyTrend(params: HttpParams): Observable<MonthlyTrendData[]> {
    return this.http.get<any[]>(`${this.API_URL}/monthly-trend`, { params }).pipe(
      map(data => data.map(item => ({
        month: item.month,
        requests: item.requests || 0,
        approvals: item.approvals || 0,
        rejections: item.rejections || 0
      }))),
      catchError(() => of([]))
    );
  }

  /**
   * Get leave type distribution
   */
  private getLeaveTypeDistribution(params: HttpParams): Observable<LeaveTypeDistribution[]> {
    return this.http.get<any>(`${this.API_URL}/leave-types`, { params }).pipe(
      map(data => {
        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];
        const total = Object.values(data).reduce((sum: number, count: any) => sum + (count || 0), 0);
        
        return Object.entries(data).map(([type, count], index) => ({
          type,
          count: count as number,
          percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
          color: colors[index % colors.length]
        }));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Get status distribution
   */
  private getStatusDistribution(params: HttpParams): Observable<StatusDistribution[]> {
    return this.http.get<any>(`${this.API_URL}/status-distribution`, { params }).pipe(
      map(data => {
        const statusColors = {
          'APPROVED': '#10B981',
          'PENDING': '#F59E0B',
          'REJECTED': '#EF4444'
        };
        
        const total = Object.values(data).reduce((sum: number, count: any) => sum + (count || 0), 0);
        
        return Object.entries(data).map(([status, count]) => ({
          status: status.charAt(0) + status.slice(1).toLowerCase(),
          count: count as number,
          percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
          color: statusColors[status as keyof typeof statusColors] || '#6B7280'
        }));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Get top employees by days taken
   */
  private getTopEmployees(params: HttpParams): Observable<TopEmployeeData[]> {
    return this.http.get<any[]>(`${this.API_URL}/top-employees`, { params }).pipe(
      map(data => data.map(item => ({
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        totalDays: item.totalDays,
        requests: item.requests,
        department: item.department
      }))),
      catchError(() => of([]))
    );
  }

  /**
   * Get recent requests
   */
  private getRecentRequests(params: HttpParams): Observable<RecentRequestData[]> {
    return this.http.get<any[]>(`${this.API_URL}/recent-requests`, { params }).pipe(
      map(data => data.map(item => ({
        id: item.id,
        employeeName: item.employeeName,
        leaveType: item.leaveType,
        startDate: item.startDate,
        endDate: item.endDate,
        duration: item.duration,
        status: item.status,
        submittedAt: item.submittedAt,
        reason: item.reason
      }))),
      catchError(() => of([]))
    );
  }

  /**
   * Get employee balances
   */
  private getEmployeeBalances(params: HttpParams): Observable<EmployeeBalanceData[]> {
    return this.http.get<any[]>(`${this.API_URL}/employee-balances`, { params }).pipe(
      map(data => data.map(item => ({
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        department: item.department,
        totalAllowance: item.totalAllowance,
        used: item.used,
        remaining: item.remaining,
        balanceStatus: this.determineBalanceStatus(item.remaining, item.totalAllowance)
      }))),
      catchError(() => of([]))
    );
  }

  /**
   * Apply drill-down filter
   */
  applyDrillDownFilter(filterType: string, value: string): void {
    const currentFilters = this.filtersSubject.value;
    const newFilters = { ...currentFilters };

    switch (filterType) {
      case 'leaveType':
        newFilters.leaveType = value;
        break;
      case 'status':
        newFilters.status = value;
        break;
      case 'employee':
        newFilters.employeeId = value;
        break;
      default:
        break;
    }

    this.loadStatistics(newFilters).subscribe();
  }

  /**
   * Export data to CSV/Excel
   */
  exportData(options: ExportOptions): void {
    switch (options.format) {
      case 'csv':
        this.exportToCSV(options.data, options.filename);
        break;
      case 'excel':
        this.exportToExcel(options.data, options.filename);
        break;
      case 'png':
        this.exportChartToPNG(options.chartRef, options.filename);
        break;
    }
  }

  /**
   * Get current filters
   */
  getCurrentFilters(): StatisticsFilters {
    return this.filtersSubject.value;
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.loadStatistics({}).subscribe();
  }

  /**
   * Build HTTP parameters from filters
   */
  private buildHttpParams(filters: StatisticsFilters): HttpParams {
    let params = new HttpParams();
    
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters.employeeId) params = params.set('employeeId', filters.employeeId);
    if (filters.department) params = params.set('department', filters.department);
    if (filters.leaveType) params = params.set('leaveType', filters.leaveType);
    if (filters.status) params = params.set('status', filters.status);
    
    return params;
  }

  /**
   * Determine balance status
   */
  private determineBalanceStatus(remaining: number, totalAllowance: number): 'low' | 'negative' | 'normal' {
    if (remaining < 0) return 'negative';
    if (remaining < totalAllowance * 0.2) return 'low';
    return 'normal';
  }

  /**
   * Export to CSV
   */
  private exportToCSV(data: any[], filename: string): void {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        `"${(row[header] || '').toString().replace(/"/g, '""')}"`
      ).join(','))
    ].join('\n');

    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  /**
   * Export to Excel (simplified CSV format)
   */
  private exportToExcel(data: any[], filename: string): void {
    // For now, export as CSV - can be enhanced with a proper Excel library
    this.exportToCSV(data, filename);
  }

  /**
   * Export chart to PNG
   */
  private exportChartToPNG(chartRef: any, filename: string): void {
    if (chartRef && chartRef.chart) {
      const canvas = chartRef.chart.canvas;
      const url = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = url;
      link.click();
    }
  }

  /**
   * Download file
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Get empty statistics data
   */
  private getEmptyStatisticsData(): StatisticsData {
    return {
      kpis: {
        totalRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        pendingRequests: 0,
        approvalRate: 0,
        avgApprovalTime: 0
      },
      monthlyTrend: [],
      leaveTypeDistribution: [],
      statusDistribution: [],
      topEmployees: [],
      recentRequests: [],
      employeeBalances: []
    };
  }
}
