export interface StatisticsKPIs {
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  pendingRequests: number;
  approvalRate: number;
  avgApprovalTime: number; // in days
}

export interface StatisticsFilters {
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
  department?: string;
  leaveType?: string;
  status?: string;
}

export interface MonthlyTrendData {
  month: string;
  requests: number;
  approvals: number;
  rejections: number;
}

export interface LeaveTypeDistribution {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopEmployeeData {
  employeeId: string;
  employeeName: string;
  totalDays: number;
  requests: number;
  department?: string;
}

export interface RecentRequestData {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: string;
  submittedAt: string;
  reason: string;
}

export interface EmployeeBalanceData {
  employeeId: string;
  employeeName: string;
  department?: string;
  totalAllowance: number;
  used: number;
  remaining: number;
  balanceStatus: 'low' | 'negative' | 'normal';
}

export interface DrillDownFilter {
  type: 'leaveType' | 'status' | 'employee' | 'month';
  value: string;
  label: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'png';
  data: any[];
  filename: string;
  chartRef?: any;
}

export interface StatisticsData {
  kpis: StatisticsKPIs;
  monthlyTrend: MonthlyTrendData[];
  leaveTypeDistribution: LeaveTypeDistribution[];
  statusDistribution: StatusDistribution[];
  topEmployees: TopEmployeeData[];
  recentRequests: RecentRequestData[];
  employeeBalances: EmployeeBalanceData[];
}

export interface StatisticsResponse {
  data: StatisticsData;
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  filters: StatisticsFilters;
}



