const THREE_MONTHS = 3 * 30 * 24 * 60 * 60 * 1000;  // milliseconds
$(document).ready(function() {
    getListOfSystemChecks().then(setChecks);
});

function setChecks(list) {
    console.log(list)
    // Big points on top
    let ssdcarderrors = 0;
    let notfitted = 0;
    let testsystems = 0;
    let offline = 0;
    let noActualData = 0;
    let blackscreens = 0;
    let oldApplication = 0;
    //Observer table
    let oberserItems = "";
    for (let check in list) {
        if (list[check].hasOwnProperty("checkResults")) {
            list[check].checkResults.sort(function(a, b) {
                return compareInverted(a.timestamp, b.timestamp);
            });
        }
        if (list[check].hasOwnProperty("checkResults") && list[check].checkResults.length > 0 && list[check].checkResults[0].smartCheck === "failed")
            ssdcarderrors++;
        if (!list[check].fitted)
            notfitted++;
        if (list[check].hasOwnProperty("deployment") && list[check].deployment && list[check].deployment.testing)
            testsystems++;
        if (list[check].hasOwnProperty("checkResults") && list[check].checkResults.length > 0 && list[check].checkResults[0].applicationState === "NOT_RUNNING")
            offline++;
        if (list[check].hasOwnProperty("checkResults") && list[check].checkResults.length > 0 && list[check].checkResults[0].applicationState === "NOT_RUNNING")
            noActualData++;
        if (list[check].hasOwnProperty("checkResults") && list[check].checkResults.length > 0 && list[check].checkResults[0].applicationState === "NOT_RUNNING")
            blackscreens++;
        //TODOif (list[check].hasOwnProperty("checkResults") && list[check].checkResults.length > 0 && list[check].checkResults[0].applicationState === "NOT_RUNNING")
            //oldApplication++;
        //oberserItems = getObserveItem(list[check]);
    }
    
    if (ssdcarderrors === 0)
        $("#ssdcarderror").css("opacity", "0.3");
    $("#ssdcarderror").find(".theNumber").text(ssdcarderrors);
    if (notfitted === 0)
        $("#notfitted").css("opacity", "0.3");
    $("#notfitted").find(".theNumber").text(notfitted);
    if (testsystems === 0)
        $("#testsystem").css("opacity", "0.3");
    $("#testsystem").find(".theNumber").text(testsystems);
    if (offline === 0)
        $("#offline").css("opacity", "0.3");
    $("#offline").find(".theNumber").text(offline);
    if (noActualData === 0)
        $("#noActualData").css("opacity", "0.3");
    $("#noActualData").find(".theNumber").text(noActualData);
    if (blackscreens === 0)
        $("#blackscreen").css("opacity", "0.3");
    $("#blackscreen").find(".theNumber").text(blackscreens);
    if (oldApplication === 0)
        $("#oldApplication").css("opacity", "0.3");
    $("#oldApplication").find(".theNumber").text(oldApplication);

    $("#observations").html(oberserItems === "" ?'<font color="white">Keine Systeme zur Beobachtung</font>' :oberserItems);
    $("#pageloader").hide();
}

function getObserveItem(item) {
    /*
    if (item.hasOwnProperty("checkResults") && item.checkResults.length > 0) {
        if 
        (new Date()) - new Date(item.checkResults.[].offlineSince) > THREE_MONTHS
        return '<tr>' +
            '<td>' + checks[check].hasOwnProperty("deployment") + '</td>' +
            '<td>Adresse gekürzt</td>' +
            '<td>Mehr als 3 Monate offline</td>' +
            '<td>11.12.2022</td>' +
            '<td><a href="#" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>' +
        '</tr>';
    }
    return '';
    */
}