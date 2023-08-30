$(document).ready(function() {
  getAllDaysChecks(30);
  $("#days").change(function() {
	$("#pageloader").show();
    let days = $("#days option:selected").val() === "allTime" ?3650 :parseInt($("#days option:selected").val());
    getAllDaysChecks(days);
  })
});

function getAllDaysChecks(days) {
    let systemsWithActualData = 0;
    let promises = [];
    promises.push(getCheckByDays(days));
    promises.push(getCheckPromis());
	Promise.all(promises).then((data) => {
        for (let system in data[1]) {
            if (data[1][system].hasOwnProperty("checkResults") && isOnDate(data[1][system].lastSync, 48) && data[1][system].checkResults.length > 0 && !data[1][system].checkResults[0].online)
                systemsWithActualData++;
        }
        data[0][1].reverse();
        if (Object.keys(data[0]).length > 1)
        data[0][2].reverse();
        let values = {"xValues":[], "ddbyValues":[], "exposeyValues":[]};
        for (let day in data[0][1]) {
            values.xValues.push(formatDate(data[0][1][day].timestamp));
            values.ddbyValues.push(data[0][1][day].offline-(day == 0 ?systemsWithActualData :0));
            if (Object.keys(data[0]).length > 1)
                values.exposeyValues.push(data[0][2][day].offline);
		}
		$("#sysChart").html('<canvas id="canvas" style="width:100%; max-width:1000px; height:300px"></canvas>');
  		renderChart(values);
  		$("#pageloader").hide();
        $('#actualData').text(systemsWithActualData);
	});
}

function renderChart(values) {
    new Chart("canvas", {
        type: "line",
        data: {
            labels: values.xValues,
            color:"rgba(255,0,255,1.0)",
            datasets: [{
                label: "DDB",
                fill: false,
                lineTension: 0,
                pointRadius: 5,
                backgroundColor: 'white',
                borderColor: "rgba(255,130,29,1.0)",
                data: values.ddbyValues
            }, {
                label: "Exposé-TV",
                fill: false,
                lineTension: 0,
                pointRadius: 5,
                backgroundColor: 'white',
                borderColor: "rgba(64, 235, 52,1.0)",
                data: values.exposeyValues
            }]
        },
        options: {
            legend: {
                display: true,
                labels: {
                    fontColor: 'rgb(255, 255, 255)'
                }
            },
            scales: {
                xAxes: [{
                    ticks: {
                        fontColor:'white',
                        padding: 5
                    },
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