// Leaflets map config
let map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Quick peek charts
function renderWindPeek() {
    var options = {
        series: [{
            name: 'Wind (km/h)',
            data: [{
                y: 15,
                x: 0
            }, {
                y: 20,
                x: 1
            }, {
                y: 15,
                x: 2
            }, {
                y: 5,
                x: 3
            }, {
                y: 20,
                x: 4
            }, {
                y: 17,
                x: 5
            }, {
                y: 20,
                x: 6
            }, {
                y: 26,
                x: 7
            }, {
                y: 30,
                x: 8
            }, {
                y: 6,
                x: 9
            }, {
                y: 3,
                x: 10
            },]
        }],
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
        colors: ['#ae3ec9']
    };

    var chart = new ApexCharts(document.querySelector("#wind-peek"), options);
    chart.render();
}

function renderTempPeek() {
    var options = {
        series: [{
            name: 'Temperature (°C)',
            data: [{
                y: 5,
                x: 0
            }, {
                y: 7,
                x: 1
            }, {
                y: 10,
                x: 2
            }, {
                y: 11,
                x: 3
            }, {
                y: 15,
                x: 4
            }, {
                y: 17,
                x: 5
            }, {
                y: 18,
                x: 6
            }, {
                y: 16,
                x: 7
            }, {
                y: 12,
                x: 8
            }, {
                y: 6,
                x: 9
            }, {
                y: 3,
                x: 10
            },]
        }],
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
        colors: ['#d63939']
    };

    var chart = new ApexCharts(document.querySelector("#temp-peek"), options);
    chart.render();
}

function renderHumidityPeek() {
    var options = {
        series: [{
            name: 'Humidity (%)',
            data: [{
                y: 70,
                x: 0
            }, {
                y: 76,
                x: 1
            }, {
                y: 78,
                x: 2
            }, {
                y: 83,
                x: 3
            }, {
                y: 90,
                x: 4
            }, {
                y: 91,
                x: 5
            }, {
                y: 91,
                x: 6
            }, {
                y: 84,
                x: 7
            }, {
                y: 78,
                x: 8
            }, {
                y: 75,
                x: 9
            }, {
                y: 73,
                x: 10
            },]
        }],
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
        colors: ['#2fb344']
    };

    var chart = new ApexCharts(document.querySelector("#humidity-peek"), options);
    chart.render();
}

function renderRainPeek() {
    var options = {
        series: [{
            name: 'Rainfall (mm)',
            data: [{
                y: 0,
                x: 0
            }, {
                y: 0,
                x: 1
            }, {
                y: 0,
                x: 2
            }, {
                y: 2,
                x: 3
            }, {
                y: 2,
                x: 4
            }, {
                y: 2,
                x: 5
            }, {
                y: 5,
                x: 6
            }, {
                y: 5,
                x: 7
            }, {
                y: 7,
                x: 8
            }, {
                y: 8,
                x: 9
            }, {
                y: 10,
                x: 10
            },]
        }],
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
        colors: ['#4263eb']
    };

    var chart = new ApexCharts(document.querySelector("#rain-peek"), options);
    chart.render();
}



// Wind direction chart
function renderWindDirectionChart() {
    var options = {
        series: [0, 0, 0, 0, 1, 5, 10, 19, 20, 25, 29, 25, 10, 6, 5, 1],
        labels: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
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
        }]
    };

    var chart = new ApexCharts(document.querySelector("#wind-direction-chart"), options);
    chart.render();
}

// Temperature chart
function renderTemperatureChart() {
    var options = {
        series: [{
            name: "Temperature (°C)",
            data: [9, 9, 9, 9, 9, 9.5, 10, 10.2, 11, 11, 11.5, 12.6, 12.5, 12, 12, 11.8, 11.4, 10, 9.8, 9.5, 8.5, 8.3, 8, 7.8]
        }],
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
            categories: ['1:00 am', '2:00 am', '3:00 am', '4:00 am', '5:00 am', '6:00 am', '7:00 am', '8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 am', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm', '8:00 pm', '9:00 pm', '10:00 pm', '11:00 pm', '12:00 pm'],
        }
    };

    var chart = new ApexCharts(document.querySelector("#temperature-chart"), options);
    chart.render();
}

renderWindPeek();
renderTempPeek();
renderHumidityPeek();
renderRainPeek();
renderWindDirectionChart();
renderTemperatureChart();