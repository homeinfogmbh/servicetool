$(document).ready(function() {
  let values = getXYValues(300);

  $("#days").change(function() {
    let days = $("#days option:selected").val() === "allTime" ?values.xValues.length :parseInt($("#days option:selected").val());
    //$("#canvas").remove();
    $("#sysChart").html('<canvas id="canvas" style="width:100%; max-width:1000px; height:300px"></canvas>');
    renderChart(values.xValues.slice(0, days), values.yValues.slice(0, days));
  });

  renderChart(values.xValues.slice(0, 30), values.yValues.slice(0, 30));
  $("#pageloader").hide();
});

function getXYValues(days) {
  let x = [];
  let y = [];
  for (let day = 1; day < days+1; day++) {
    x.push(day);
    y.push(Math.floor(Math.random() * 100) + 1);
  }
  return {"xValues":x, "yValues":y};
}

function renderChart(xValues, yValues) {
  new Chart("canvas", {
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
          },
          scaleLabel: {
            display: true,
            color:'white',
            labelString: 'Tage',
            fontColor:'white',
            fontSize: 20
          }
        }],
        yAxes: [{
          ticks: {fontColor:'white'},
          gridLines: {
            lineWidth: 0,
            display: true,
            //drawOnChartArea: false,
            color: 'white',
            zeroLineColor: 'white',
            zeroLineWidth: 3,
          },
          scaleLabel: {
            display: true,
            labelString: 'Offline',
            fontColor:'white',
            fontSize: 20
          }
        }]
      }
    }
  });
}