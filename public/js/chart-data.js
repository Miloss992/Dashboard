
$(document).ready(function () {
  $.ajax({
    type: "POST",
    url: "/ChartData",
    data: "",
    contentType: "application/json, charset=utf-8",
    dataType: "json",
    success: function (data) {
      var _data = data;
      var _date = _data.sortedByDate.date;
      var _profit = _data.sortedByDate.profit;
      var _costs = _data.sortedByDate.costsOfSales;
      var _sales = _data.sortedByDate.sales;
      var _grossSales = _data.sortedByDate.grossSales;

      var _s1Sales = _data.segmentChart.s1Sales;
      var _s2Sales = _data.segmentChart.s2Sales;
      var _s3Sales = _data.segmentChart.s3Sales;
      var _s4Sales = _data.segmentChart.s4Sales;
      var _s5Sales = _data.segmentChart.s5Sales;

      var _c1Sales = _data.countrySales.c1Sales;
      var _c2Sales = _data.countrySales.c2Sales;
      var _c3Sales = _data.countrySales.c3Sales;
      var _c4Sales = _data.countrySales.c4Sales;
      var _c5Sales = _data.countrySales.c5Sales;

      var _c1Units = _data.countryUnits.c1Units;
      var _c2Units = _data.countryUnits.c2Units;
      var _c3Units = _data.countryUnits.c3Units;
      var _c4Units = _data.countryUnits.c4Units;
      var _c5Units = _data.countryUnits.c5Units;

      var options = {
        series: [{
          name: 'Sales',
          data: _sales,
        }, {
          name: 'Revenue',
          data: _profit,
        }, {
          name: 'Costs',
          data: _costs,
        }],
        chart: {
          height: 350,
          type: 'area',
          toolbar: {
            show: false
          },
        },
        markers: {
          size: 4
        },
        colors: ['#4154f1', '#2eca6a', '#ff771d'],
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.3,
            opacityTo: 0.4,
            stops: [0, 90, 100]
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          width: 2
        },
        xaxis: {
          type: 'datetime',
          categories: _date,
          labels: {
            show: false,
            format: 'yyyy',
            datetimeFormatter: {
              year: 'yyyy',
              month: 'MMM \'yy',
              day: 'dd MMM',
            }
          }
        },
        tooltip: {
          x: {
            format: 'dd/MM/yy HH:mm'
          },
        }
      };
      var reportsChart = new ApexCharts(document.querySelector("#reportsChart"), options);
      reportsChart.render();

      var options = {
        series: [_s1Sales, _s2Sales, _s3Sales, _s4Sales, _s5Sales],
        chart: {
          height: 350,
          type: 'pie',
          toolbar: {
            show: true
          }
        },
        labels: ['Segment 1', 'Segment 2', 'Segment 3', 'Segment 4', 'Segment 5']
      };

      var pieChart = new ApexCharts(document.querySelector("#pieChart"), options);
      pieChart.render();

      var options = {
        series: [{
          name: 'Sales',
          data: _sales,
        }, {
          name: 'Costs',
          data: _costs,
        }, {
          name: 'Revenue',
          data: _profit,
        }],
        chart: {
          type: 'bar',
          height: 350
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: _date,
          labels: {
            show: false,
            format: 'dd/MM/yyyy',
          }
        },
        yaxis: {
          title: {
            text: '$ (dolars)'
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          x: {
            format: 'dd/MM/yy'
          },
          y: {
            formatter: function (val) {
              return "$ " + val
            }
          }
        }
      };

      var columnChart = new ApexCharts(document.querySelector("#columnChart"), options);
      columnChart.render();

      var options = {
        series: [{
          name: "Gross Sales",
          data: _grossSales,
        }],
        chart: {
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'straight'
        },
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5
          },
        },
        xaxis: {
          categories: _date,
          labels: {
            show: false,
            format: 'dd/MM/yyyy',
          }
        }

      };

      var lineChart = new ApexCharts(document.querySelector("#lineChart"), options);
      lineChart.render();

      var options = {
        series: [_c1Sales, _c2Sales, _c3Sales, _c4Sales, _c5Sales],
        chart: {
          height: 350,
          type: 'donut',
          toolbar: {
            show: true
          }
        },
        labels: ['Country 1', 'Country 2', 'Country 3', 'Country 4', 'Country 5']
      };

      var pieChartF = new ApexCharts(document.querySelector("#donutChart"), options);
      pieChartF.render();

      var options = {
        series: [{
          data: [_c1Units, _c2Units, _c3Units, _c4Units, _c5Units],
        }],
        chart: {
          type: 'bar',
          height: 350
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
          }
        },
        dataLabels: {
          enabled: true
        },
        xaxis: {
          categories: ['Country 1', 'Country 2', 'Country 3', 'Country 4', 'Country 5'],

        }
      };

      var BarChart = new ApexCharts(document.querySelector("#barChart"), options);
      BarChart.render();

    },
    error: function (data) {
      alert("Error Occured!");
    },
  })
});
