export const ChartSetup = {
  type: 'scatter',
  responsive: true,
  maintainAspectRatio: false,
  options: {
    animation: false,
    parsing: false,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        displayColors: false,
        padding: 12,
        caretPadding: 16,
        bodyFont: {
          size: 14
        },
        filter: tooltipItem => {
          return tooltipItem.datasetIndex === 0;
        }
      },
      crosshair: {
        sync: {
          enabled: false
        },
        line: {
          color: '#232323dd',
          width: 1,
          dashPattern: [4, 5],
          greyOutBehind: true
        },
        zoom: {
          enabled: false, // if true: issue with point selection onClick
          zoomButtonText: 'Reset',
          zoomButtonClass: 'reset-zoom'
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Seconds',
          padding: {
            top: 20
          },
          color: '#16A085',
          font: {
            weight: 'bold',
            size: 14
          }
        },
        ticks: {
          color: '#232323',
          source: 'auto',
          maxRotation: 0,
          autoSkip: true
          // sampleSize: 1
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Degrees',
          padding: {
            bottom: 20
          },
          color: '#16A085',
          font: {
            weight: 'bold',
            size: 14
          }
        },
        ticks: {
          color: '#232323',
          source: 'auto',
          maxRotation: 0,
          autoSkip: true
          // sampleSize: 1
        }
      }
    },
    onHover: (event, chart) => {
      event.native.target.style.cursor = chart[0] ? 'pointer' : 'default';
    },
    onClick: (event, element, plot) => {}
  },
  data: {
    datasets: [
      {
        drawActiveElementsOnTop: true,
        pointBorderWidth: 1,
        pointHoverRadius: 10,
        pointBackgroundColor: '#16A085',
        pointHoverBorderColor: '#232323dd',
        pointHoverBorderWidth: 2,
        pointRadius: 3,
        borderWidth: 2,
        pointStyle: 'circle',
        borderColor: '#16A085',
        showLine: true,
        fill: true,
        interpolate: true,
        lineTension: 0,
        order: 3
      },
      {
        drawActiveElementsOnTop: true,
        pointBorderWidth: 1,
        pointHoverRadius: 10,
        pointBackgroundColor: '#FF5722',
        pointHoverBorderWidth: 2,
        pointRadius: 6,
        borderWidth: 5,
        pointStyle: 'circle',
        borderColor: '#232323dd',
        showLine: false,
        fill: true,
        interpolate: true,
        lineTension: 0,
        order: 2
      },
      {
        drawActiveElementsOnTop: true,
        pointBorderWidth: 1,
        pointHoverRadius: 10,
        pointBackgroundColor: '#3949AB',
        pointHoverBorderWidth: 2,
        pointRadius: 6,
        borderWidth: 5,
        pointStyle: 'circle',
        borderColor: '#232323dd',
        showLine: false,
        fill: true,
        interpolate: true,
        lineTension: 0,
        order: 1
      }
    ]
  }
};
