import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
  })
  
export class AppComponent implements AfterViewInit {
    @ViewChild('chart') chartElement!: ElementRef<HTMLCanvasElement>;


  // 初始侧边栏显示状态
  public sidebarOpen = false;
  public darkThemeEnabled = false;

  ngAfterViewInit(): void {
    // 创建图表实例
    const chartContext = this.chartElement.nativeElement.getContext('2d');
    if (!chartContext) {
        throw new Error('Canvas context is null');
    }
      
      new Chart(chartContext, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mart', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mart', 'Apr'],
        datasets: [
          {
            label: 'GOLD',
            data: [1796, 1908, 1936, 1895, 1836, 1807, 1765, 1710, 1660, 1632, 1768, 1822, 1928, 1881],
            borderColor: 'green',
            borderWidth: 2
          },
          {
            label: 'ETH',
            data: [2688, 2922, 3282, 2728, 1940, 1071, 1679, 1554, 1328, 1572, 1294, 1194, 1585, 1677],
            borderColor: 'blue',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true
      }
    });
  }

  // 用于打开或关闭侧边栏
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // 切换主题
  toggleTheme() {
    this.darkThemeEnabled = !this.darkThemeEnabled;
  }
}
