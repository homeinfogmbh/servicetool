var _systemchecksByDays = null;
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
	let promises = [];
	promises.push(getBlacklist());
	for (let day = 0; day < days; day++)
		promises.push(getCheckByDays(day));
	
	Promise.all(promises).then((data) => {
    	_systemchecksByDays = {};
    	let found;
		let daysCheck
    	let blacklistitem;
    	for (let dataDaysCounter = 0; dataDaysCounter < data.length-1; dataDaysCounter++) {
      		_systemchecksByDays[dataDaysCounter] = [];
			for (daysCheck in data[dataDaysCounter+1]) {
				found = false;
				for (blacklistitem of data[0]) {
					if (data[dataDaysCounter+1][daysCheck].id === blacklistitem.id) {
						found = true;
						break;
					}
				}
				if (!found && data[dataDaysCounter+1][daysCheck].hasOwnProperty("checkResults") && data[dataDaysCounter+1][daysCheck].checkResults.length > 0 && data[dataDaysCounter+1][daysCheck].checkResults[0].hasOwnProperty("offlineSince") && data[dataDaysCounter+1][daysCheck].checkResults[0].sshLogin !== "success" && !data[dataDaysCounter+1][daysCheck].checkResults[0].icmpRequest && data[dataDaysCounter+1][daysCheck].fitted && data[dataDaysCounter+1][daysCheck].hasOwnProperty("deployment") && !data[dataDaysCounter+1][daysCheck].deployment.testing && data[dataDaysCounter+1][daysCheck].operatingSystem.toLowerCase().indexOf("windows") === -1)
					_systemchecksByDays[dataDaysCounter].push(data[dataDaysCounter+1][daysCheck]);
			}
		}
		$("#sysChart").html('<canvas id="canvas" style="width:100%; max-width:1000px; height:300px"></canvas>');
  		let values = getXYValues(_systemchecksByDays);
  		renderChart(values.xValues, values.yValues); // TODO splice array, if less then rendered
  		$("#pageloader").hide();
	});
}

function getXYValues(dataForDays) {
  let x = [];
  let y = [];
  for (let day in dataForDays) {
    x.push(parseInt(day)+1);
    y.push(dataForDays[day].length);
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