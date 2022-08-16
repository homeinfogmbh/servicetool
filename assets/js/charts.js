$(document).ready(function() {
  getAllDaysChecks(30);
  $("#days").change(function() {
	$("#pageloader").show();
	// TODO allTime?
    let days = $("#days option:selected").val() === "allTime" ?365 :parseInt($("#days option:selected").val());
    getAllDaysChecks(days);
  })
});

function getAllDaysChecks(days) {
	// Todo save for not double loadings?
	getCheckByDays(days).then((data) => {
		let values = {"xValues":[], "ddbyValues":[], "exposeyValues":[]};
		for (let day in data[1]) {
			values.xValues.push(day);
			values.ddbyValues.push(data[1][day].offline);
			values.exposeyValues.push(data[2][day].offline);
		}
		$("#sysChart").html('<canvas id="canvas" style="width:100%; max-width:1000px; height:300px"></canvas>');
  		
  		renderChart(values);
  		$("#pageloader").hide();
	});
}

function renderChart(values) {
  new Chart("canvas", {
    type: "line",
    data: {
		labels: values.xValues,
		color:"rgba(255,0,255,1.0)",
    	datasets: [{
			fill: false,
			lineTension: 0,
			pointRadius: 5,
			backgroundColor: 'white',
			borderColor: "rgba(255,130,29,1.0)",
			data: values.ddbyValues
    	}, {
			fill: false,
			lineTension: 0,
			pointRadius: 5,
			backgroundColor: 'white',
			borderColor: "rgba(255,130,29,1.0)",
			data: values.exposeyValues
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
          ticks: {min:0, fontColor:'white'},
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