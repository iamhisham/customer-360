import { Component, Input, OnInit } from '@angular/core';

import { ConstantService } from 'src/app/service/constant.service';
import { SubscriptionService } from 'src/app/modules/customer-module/services/subscription.service';
import { UsageAndBalanceService } from 'src/app/modules/customer-module/services/usage-and-balance.service';

@Component({
  selector: 'app-usage-and-balance',
  templateUrl: './usage-and-balance.component.html',
  styleUrls: ['./usage-and-balance.component.scss'],
})
export class UsageAndBalanceComponent implements OnInit {
  @Input() customerId: any;
  @Input() accountId: any;
  usageAndBalanceDetails: any;
  selectedList: any = 'Monthly';
  selectedView: any = 'CHART';

  spline: any;
  barWeekly: any;
  barMonthly: any;

  usageAndBalanceTable: any = {
    name: "usageAndBalance",
    pk: "ac_no",
    needServerSidePagination: true,
    fields: [
      { name: "Months", attr: "month" },
      { name: "Consumed", attr: "consumedData" },
      { name: "Prediction", attr: "predictionData" },
    ],
    getRecord: (params: any) => this.usageAndBalanceService.usageAndBalanceGrid().toPromise(),
    // buildData: (usageBal: any) => {
    //   return usageBal.map((usageBalance: any) => {
    //     return {
    //       month: usageBalance.month,
    //       consumedData: usageBalance.consumedData,
    //       predictionData: usageBalance.predictionData
    //     };
    //   });
    // }
  };

  constructor(private constantService: ConstantService, private subscriptionService: SubscriptionService, 
    private usageAndBalanceService: UsageAndBalanceService) { }

  ngOnInit() {
    this.init();
  }

  async init(accountId: any = this.accountId) {
    this.accountId = accountId;
    if (this.customerId) {
      await Promise.all([
        this.getAllSubscriptionsByCustomerId(),
      ]);
    }
  }

  async getAllSubscriptionsByCustomerId() {
    try {
      this.usageAndBalanceDetails = null;
      if (this.accountId) {
        this.usageAndBalanceDetails = (await this.subscriptionService.getSubscriptionsByCustomerIdWithAccountId(this.customerId, this.accountId, this.constantService.CONST.SUBSCRIPTION.EMBED_SERVICE_DETAILS).toPromise() as any).data;
      } else {
        this.usageAndBalanceDetails = (await this.subscriptionService.getSubscriptionsByCustomerId(this.customerId, this.constantService.CONST.SUBSCRIPTION.EMBED_SERVICE_DETAILS).toPromise() as any).data;
      }

      // Sorting subscriptions by status (Active first, then Pending)
      this.usageAndBalanceDetails.sort((a: any, b: any) => {
        if (a.status === "ACTIVE" && b.status !== "ACTIVE") {
          return -1;
        } else if (a.status !== "ACTIVE" && b.status === "ACTIVE") {
          return 1;
        } else {
          return 0;
        }
      });
      await Promise.all(this.usageAndBalanceDetails.map(async (subscription: any) => {
        this.getSubscriptionSummary(subscription);
      }));
    } catch (e: any) {
      console.log((e.error?.error?.message || e.message || e), 'ERROR');
    }
  }

  async getSubscriptionSummary(subscription: any) {
    subscription.dataUsageDetails = null;
    await Promise.all(['dataUsageDetails'].map(async (key: string) => {
      subscription.dataUsageDetails = await this.subscriptionService.getSummaryByCustomerIdandAccountIdWithsubscriptionId(this.customerId, this.accountId, subscription.id).toPromise()
      const dataUsedPercent = subscription.dataUsageDetails.dataUsedPercentage;
      subscription.chart = await this.dataUsedPercentageChart(dataUsedPercent);
      subscription.viewMoreLessFlag = false;
      subscription.graphGridFlag = false;
    }));
  }

  showComponent(value: any, usageAndBalance?: any) {
    this.selectedList = value;
    this.buildCharts(this.selectedList, usageAndBalance.id)
  }

  viewMoreLess(subObj: any, index: number) {
    this.usageAndBalanceDetails[index].viewMoreLessFlag = !subObj.viewMoreLessFlag;
  }

  graphGridView(openCloseFlag: any, index: number) {
    if ((this.selectedView === 'CHART' && !openCloseFlag) || (this.selectedView === 'GRID' && openCloseFlag)) {
      return;
    }
    this.usageAndBalanceDetails[index].graphGridFlag = !openCloseFlag;
  }

  async buildCharts(selectedList: string, subscriptionId: any) {
    let chartResponse: any;
    if (selectedList === 'Daily') chartResponse = await this.usageAndBalanceService.chartDetailsDaily(subscriptionId);
    else chartResponse = await this.usageAndBalanceService.chartDetailsMonthly(subscriptionId);
    return this.barChartRender(chartResponse);
  }

  async dataUsedPercentageChart(seriesValue?: any) {
    return {
      colors: ['#5164B8'],
      series: [seriesValue],
      chart: {
        height: 180,
        type: "radialBar"
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            height: 180
          }
        }
      }],
      plotOptions: {
        radialBar: {
          hollow: {
            size: "50%"
          },
          dataLabels: {
            name: {
              show: true,
              color: "#000",
              offsetY: 4
            },
            value: {
              show: false
            }
          },
          track: {
            background: '#D0E5FC'
          }
        }
      },
      labels: [seriesValue + ' %']
    };
  }

  async barChartRender(data: any) {
    return this.barMonthly = {
      series: [
        {
          name: "Consumed",
          data: data?.consumedData
        },
        {
          name: "Prediction",
          data: data?.predictionData
        }
      ],
      colors: ["#FEC527", "#5875CB"],
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false
        }
      },
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "right"
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded"
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: data.xAxis
      },
      yaxis: {
        // title: {
        //   text: "$ (thousands)"
        // },
        labels: {
          formatter: (value: any) => {
            return value + ' GB';
          }
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val + " GB";
          }
        }
      }
    };
  }

  // async areaChartRender() {
  //   return this.spline = {
  //     series: [
  //       {
  //         name: "Download",
  //         data: [100, 351, 88, 51, 40, 10, 100, 131, 40, 228]
  //       },
  //       {
  //         name: "Upload",
  //         data: [302, 45, 156, 34, 52, 39, 31, 400, 238, 50]
  //       }
  //     ],
  //     legend: {
  //       show: true,
  //       position: "bottom",
  //       horizontalAlign: "right"
  //     },
  //     colors: ["#FEC527", "#5875CB"],
  //     chart: {
  //       height: 350,
  //       type: "area",
  //       toolbar: {
  //         show: false
  //       }
  //     },
  //     stroke: {
  //       curve: "smooth",
  //       width: 1
  //     },
  //     xaxis: {
  //       categories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  //     },
  //     yaxis: {
  //       labels: {
  //         formatter: (value: any) => {
  //           return value + " GB";
  //         }
  //       }
  //     },
  //     dataLabels: {
  //       enabled: false
  //     }
  //   };
  // }

}
