import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import { catchError, of } from 'rxjs';


interface CryptoCard {
  id: number;
  currencyType: string;
  currencyAmount: number;
  cardHolder: string;
  expiry: string;
  cvv: number;
}

interface TradeResponse {
    id: number;
    btcAmount: number;
    pricePerBtc: number;
    tradeTime: string;
}
  

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('chart') chartElement!: ElementRef<HTMLCanvasElement>;
  
  public sidebarOpen = false;
  public darkThemeEnabled = false;
  public cryptoCards: CryptoCard[] = []; // Array to store the cards
  private chart: Chart | null = null;
  public trades: TradeResponse[] = []; // 存储交易记录
  
  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    // 获取加密货币卡数据
    this.fetchCryptoCards();
    // 获取并绘制BTC图表
    this.drawBtcChart();
    this.getTrades(); // 添加这行来获取交易记录
  } 
  
  fetchCryptoCards(): void {
    this.http.get<CryptoCard[]>('http://localhost:8088/api/getAllCryptoCards').subscribe(cards => {
      this.cryptoCards = cards;
    });
  }
  
  drawBtcChart(): void {
    this.http.get<any>('http://localhost:8084/api/bitcoin/latest-message').subscribe(data => {
      const timeSeries = data['Time Series (Digital Currency Monthly)'];
      const dates = Object.keys(timeSeries).reverse(); // Reverse the order to display recent dates first
      const btcData = dates.map(date => parseFloat(timeSeries[date]['4a. close (SGD)']));
      const labels = dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));

      const chartContext = this.chartElement.nativeElement.getContext('2d');
      if (!chartContext) {
        throw new Error('Canvas context is null');
      }

      new Chart(chartContext, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'BTC',
              data: btcData,
              borderColor: 'orange',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true
        }
      });
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleTheme() {
    this.darkThemeEnabled = !this.darkThemeEnabled;
  }
    
    // 新方法：发送交易请求
  // 更新后的方法来发起交易
  makeTrade(btcAmount: number): void {
    // 首先获取比特币的实时价格
    this.http.get<number>('http://localhost:8086/btc/price').subscribe(
      pricePerBtc => {
        console.log("pricePerBtc: " + pricePerBtc)
        // 拿到价格后，发起交易请求
        if (pricePerBtc) {
          const url = 'http://localhost:8081/api/trades/btc'; // 后端API URL
          const tradeData = { btcAmount, pricePerBtc }; // 使用实时价格

          this.http.post<TradeResponse>(url, tradeData).pipe(
            catchError(error => {
              console.error('Trade request failed', error);
              return of(null); // 在错误情况下返回null
            })
          ).subscribe(response => {
            if (response) {
              console.log('Trade successful:', response);
              // TODO: 更新图表逻辑
            } else {
              console.log('Trade request failed');
            }
          });
        } else {
          console.error('Failed to get the real-time BTC price');
        }
      },
      error => {
        console.error('Failed to get the real-time BTC price', error);
      }
    );
  }
    
    // 添加一个新方法来获取交易记录
    getTrades(): void {
        const url = 'http://localhost:8081/api/trades/getTransactionDate';
        this.http.get<TradeResponse[]>(url).subscribe(trades => {
            this.trades = trades;
            this.sortTradesByTime(); // 在获取交易数据后调用排序方法
        });
    }
    sortTradesByTime() {
        // 使用 sort 方法按照交易时间进行排序，最新的交易在前面
        this.trades.sort((a, b) => {
            return new Date(b.tradeTime).getTime() - new Date(a.tradeTime).getTime();
        });
    }
    

  
}
