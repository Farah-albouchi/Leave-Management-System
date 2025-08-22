import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartType, ChartData } from 'chart.js';


@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.css']
})
export class StatisticsComponent implements OnInit {
  totalRequests = 123;
  approvedRequests = 84;
  rejectedRequests = 21;
  pendingRequests = 18;
  
  leaveTypeData = [
    { type: 'Vacation', count: 40 },
    { type: 'Sick Leave', count: 30 },
    { type: 'Casual Leave', count: 12 },
    { type: 'Unpaid Leave', count: 6 }
  ];

  leaveTypeChart: ChartData<'doughnut'> = {
    labels: this.leaveTypeData.map(t => t.type),
    datasets: [
      {
        data: this.leaveTypeData.map(t => t.count),
        backgroundColor: ['#60a5fa', '#f87171', '#facc15', '#a78bfa']
      }
    ]
  };

  leaveTypeChartType: ChartType = 'doughnut';
  barChartData: ChartData<'bar'> = {
    labels: this.leaveTypeData.map(t => t.type),
    datasets: [
      {
        label: 'Leave Count',
        data: this.leaveTypeData.map(t => t.count),
        backgroundColor: '#60a5fa',
        borderRadius: 6,
        barThickness: 30
      }
    ]
  };
  
  barChartOptions = {
    responsive: true,
    indexAxis: 'y' as const, // horizontal bars
    scales: {
      x: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: { display: false }
    }
  };
  
  barChartType: ChartType = 'bar';
  

  ngOnInit() {}
}
