var _hipsterIsOnline = true;
$(document).ready(function() {
    var xValues = [50,60,70,80,90,100,110,120,130,140,150];
    var yValues = [7,8,8,9,9,9,10,11,14,14,15];
    
    new Chart("myChart", {
      type: "line",
      data: {
        labels: xValues,
        color:"rgba(255,0,255,1.0)",
        datasets: [{
          fill: false,
          lineTension: 0,
          pointRadius: 5,
          backgroundColor: 'white',
          borderColor: "rgba(255,130,29,1.0)",
          data: yValues
        }]
      },
      options: {
        legend: {display: false},
        scales: {
          xAxes: [{
            ticks: {fontColor:'white'},
            gridLines: {
              display: true,
              color: 'white',
              zeroLineColor: 'white',
              zeroLineWidth: 3,
            }
          }],
          yAxes: [{
            ticks: {min: 0, max:16, fontColor:'white'},
            gridLines: {
              lineWidth: 0,
              display: true,
              //drawOnChartArea: false,
              color: 'white',
              zeroLineColor: 'white',
              zeroLineWidth: 3,
            }
          }]
        }
      }
    });
    $("#pageloader").hide();
});
