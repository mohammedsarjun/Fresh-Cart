!(function () {
  'use strict';
  var e;
  document.getElementById('revenueChart') &&
    ((e = {
      series: [
        { name: 'Total Income', data: [31, 40, 28, 51, 42, 67, 100] },
        { name: 'Total Expense', data: [78, 32, 45, 79, 34, 44, 38] },
      ],
      labels: [
        'Jan',
        'Feb',
        'March',
        'April',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      chart: { height: 350, type: 'area', toolbar: { show: !1 } },
      dataLabels: { enabled: !1 },
      markers: { size: 5, hover: { size: 6, sizeOffset: 3 } },
      colors: ['#0aad0a', '#ffc107'],
      stroke: { curve: 'smooth', width: 2 },
      grid: { borderColor: '#dfe2e1' },
      xaxis: {
        labels: {
          show: !0,
          align: 'right',
          minWidth: 0,
          maxWidth: 160,
          style: {
            fontSize: '12px',
            fontWeight: 400,
            colors: ['#5c6c75'],
            fontFamily: '"Inter", "sans-serif"',
          },
        },
        axisBorder: {
          show: !0,
          color: '#dfe2e1',
          height: 1,
          width: '100%',
          offsetX: 0,
          offsetY: 0,
        },
        axisTicks: {
          show: !0,
          borderType: 'solid',
          color: '#dfe2e1',
          height: 6,
          offsetX: 0,
          offsetY: 0,
        },
      },
      legend: {
        position: 'top',
        fontWeight: 600,
        color: '#5c6c75',
        markers: {
          width: 8,
          height: 8,
          strokeWidth: 0,
          strokeColor: '#fff',
          fillColors: void 0,
          radius: 12,
          customHTML: void 0,
          onClick: void 0,
          offsetX: 0,
          offsetY: 0,
        },
        labels: { colors: '#5c6c75', useSeriesColors: !1 },
      },
      yaxis: {
        labels: {
          formatter: function (e) {
            return e + 'k';
          },
          show: !0,
          align: 'right',
          minWidth: 0,
          maxWidth: 160,
          style: {
            fontSize: '12px',
            fontWeight: 400,
            colors: '#5c6c75',
            fontFamily: '"Inter", "sans-serif"',
          },
        },
      },
    }),
    new ApexCharts(document.getElementById('revenueChart'), e).render()),
    document.getElementById('totalSale') &&
      ((e = {
        series: [6e3, 2e3, 1e3, 600],
        labels: ['Shippings', 'Refunds', 'Order', 'Income'],
        colors: ['#0aad0a', '#ffc107', '#db3030', '#016bf8'],
        chart: { type: 'donut', height: 280 },
        legend: { show: !1 },
        dataLabels: { enabled: !1 },
        plotOptions: {
          pie: {
            donut: {
              size: '85%',
              background: 'transparent',
              labels: {
                show: !0,
                name: {
                  show: !0,
                  fontSize: '22px',
                  fontFamily: '"Inter", "sans-serif"',
                  fontWeight: 600,
                  colors: ['#5c6c75'],
                  offsetY: -10,
                  formatter: function (e) {
                    return e;
                  },
                },
                value: {
                  show: !0,
                  fontSize: '24px',
                  fontFamily: '"Inter", "sans-serif"',
                  fontWeight: 800,
                  colors: '#21313c',
                  offsetY: 8,
                  formatter: function (e) {
                    return e;
                  },
                },
                total: {
                  show: !0,
                  showAlways: !1,
                  label: 'Total Sales',
                  fontSize: '16px',
                  fontFamily: '"Inter", "sans-serif"',
                  fontWeight: 400,
                  colors: '#c1c7c6',
                  formatter: function (e) {
                    return e.globals.seriesTotals.reduce((e, t) => e + t, 0);
                  },
                },
              },
            },
          },
        },
        stroke: { width: 0 },
        responsive: [
          {
            breakpoint: 1400,
            options: { chart: { type: 'donut', width: 290, height: 330 } },
          },
        ],
      }),
      new ApexCharts(document.getElementById('totalSale'), e).render());
})();
