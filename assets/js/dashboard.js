$(document).ready(function() {
    getListOfSystemChecks().then(setChecks);
    $('.btn_list').click(function(e) {
        window.location.href = "listenansicht.html?type=" + $(this).attr("id");
		e.preventDefault();
	}); 
    $('#observercounter').click(function(e) {
        $(".observerItem").show();
		e.preventDefault();
	}); 
});

function setChecks(list) {
    list = $.map(list, function(value, index){
        return [value];
    });
    console.log(list);
    // Big points on top
    let ssdcarderrors = 0;
    let notfitted = 0;
    let testsystems = 0;
    let offline = 0;
    let noActualData = 0;
    let blackscreens = 0;
    let oldApplication = 0;
    //Observer table
    let observerItems = [];
    for (let check of list) {
        if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].smartCheck === "failed") {
            ssdcarderrors++;
            observerItems.push(getObserveItem(check, "SSD Fehler", observerItems.length));
        }
        if (!check.fitted) {
            notfitted++;
            observerItems.push(getObserveItem(check, "Nicht verbaut", observerItems.length));
        }
        if (check.hasOwnProperty("deployment") && check.deployment.testing) {
            testsystems++;
            observerItems.push(getObserveItem(check, "Testsystem", observerItems.length));
        }
        if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("offlineSince")) {
            offline++;
            if (!isOnDate(check.checkResults[0].offlineSince, THREE_MONTHS))
                observerItems.push(getObserveItem(check, "Mehr als 3 Monate offline", observerItems.length));
        }
        if (!isOnDate(check.lastSync, 24)) {
            noActualData++;
            if (!isOnDate(check.lastSync, THREE_MONTHS))
                observerItems.push(getObserveItem(check, "Alte Daten", observerItems.length));
        }
        if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].applicationState === "not running") {
            blackscreens++;
            observerItems.push(getObserveItem(check, "Schwarz-Bildmodus", observerItems.length));
        }
        //TODOif (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].applicationState === "NOT_RUNNING")
            //oldApplication++;
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

    $("#observations").html(getObserverItems(observerItems));
    if (observerItems.length > 10)
        $("#observercounter").text("Alle " + observerItems.length + " Meldungen anzeigen"); // TODO clickable
    $("#pageloader").hide();
}

function getObserveItem(item, annotation, counter) {
    let address = item.hasOwnProperty("deployment") ?item.deployment.hasOwnProperty("address") ?item.deployment.address.street + " " + item.deployment.address.houseNumber + " " + item.deployment.address.zipCode + " " + item.deployment.address.city :'Keine Adresse' :'';
    return '<tr ' + (counter > 10 ?'class="observerItem" style="display:none"' :'') + '>' +
        '<td title="System-ID: ' + item.id  + '">' + (item.hasOwnProperty("deployment") ?item.deployment.customer.company.abbreviation :'Keine Zuordnung') + '</td>' +
        '<td title="' + address + '">' + address.substring(0, 12) + (address != '' ? '...' :'') +  '</td>' +
        '<td>' + annotation + '</td>' +
        '<td>' + (item.hasOwnProperty("checkResults") && item.checkResults.length > 0 ?formatDate(item.checkResults[0].timestamp) :"-") + '</td>' +
        '<td><a href="display-details.html?id=' + item.id + '" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>' +
    '</tr>';
}
function getObserverItems(observerItems) {
    if (observerItems.length === 0)
        return '<font color="white">Keine Systeme zur Beobachtung</font>';
    let dom = "";
    for (let item = 0; item < observerItems.length; item++)
            dom += observerItems[item];           
    return dom;
}
