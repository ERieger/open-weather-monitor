// This file contains pre-defined dropin configurations for all the apex charts graphs.
// It is more efficient to define once and customise rather than redefining the same values repeatedly.
let peekGraphTemplate = {
    series: [],
    chart: {
        type: 'area',
        height: '100%',
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    stroke: {
        curve: 'smooth',
    },
    dataLabels: {
        enabled: false
    },
    xaxis: {
        type: 'datetime',
        floating: true,
        axisTicks: {
            show: false
        },
        labels: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    yaxis: {
        floating: true,
        axisTicks: {
            show: false
        },
        labels: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    grid: {
        show: false,
    },
    noData: {
        text: 'Loading...'
    }
}

let windDirectionChartTemplate = {
    series: [],
    labels: [],
    chart: {
        type: 'polarArea',
    },
    stroke: {
        colors: ['#fff']
    },
    fill: {
        opacity: 0.8
    },
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 200
            },
            legend: {
                position: 'bottom'
            }
        }
    }],
    noData: {
        text: 'Loading...'
    }
};

let tempChartTemplate =  {
    series: [],
    chart: {
        height: '100%',
        type: 'line',
        zoom: {
            enabled: false
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth'
    },
    grid: {
        row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
        },
    },
    xaxis: {
        type: 'datetime'
    },
    noData: {
        text: 'Loading...'
    }
};