$(document).ready(function() {
    getListOfSystemChecks().then(setChecks);
    $('#observercounter').click(function(e) {
        $(".observerItem").show();
		e.preventDefault();
	}); 
});

function setChecks(list) {
    list = setCheckList(list);
    //Observer table
    let observerItems = [];
    for (let check of list) {
        if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].smartCheck === "failed")
            observerItems.push(getObserveItem(check, "SSD Fehler", observerItems.length));
        if (!check.fitted)
            observerItems.push(getObserveItem(check, "Nicht verbaut", observerItems.length));
        if (check.hasOwnProperty("deployment") && check.deployment.testing)
            observerItems.push(getObserveItem(check, "Testsystem", observerItems.length));
        if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("offlineSince") && !isOnDate(check.checkResults[0].offlineSince, THREE_MONTHS))
            observerItems.push(getObserveItem(check, "Mehr als 3 Monate offline", observerItems.length));
        //if (!isOnDate(check.lastSync, 24)) {
            if (!isOnDate(check.lastSync, THREE_MONTHS))
                observerItems.push(getObserveItem(check, "Alte Daten", observerItems.length));
        //}
        if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].applicationState === "not running")
            observerItems.push(getObserveItem(check, "Schwarz-Bildmodus", observerItems.length));
        //TODOif (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].applicationState === "NOT_RUNNING")
    }

    // Widgets
    let errorsDOM = "";
    for (let item in _commonChecks) {
        if (_commonChecks[item].systems.length !== 0 && _commonChecks[item].show) {
            errorsDOM += '<div class="col btn_list pointer" data-id="' + item + '">' +
                '<div class="number_box">' +
                    '<span class="theNumber">' + _commonChecks[item].systems.length + '</span>' +
                    '<h5>' + _commonChecks[item].title + '</h5>' +
                '</div>' +
            '</div>';
        }
    }
    $("#widgets").html(errorsDOM);
    $('.btn_list').click(function(e) {
        window.location.href = "listenansicht.html?type=" + $(this).data("id");
		e.preventDefault();
	}); 

    $("#observations").html(getObserverItems(observerItems));
    if (observerItems.length > 10)
        $("#observercounter").text("Alle " + observerItems.length + " Meldungen anzeigen"); // TODO clickable
    $("#pageloader").hide();
}

function getObserveItem(item, annotation, counter) {
    let address = item.hasOwnProperty("deployment") ?item.deployment.hasOwnProperty("address") ?item.deployment.address.street + " " + item.deployment.address.houseNumber + " " + item.deployment.address.zipCode + " " + item.deployment.address.city :'Keine Adresse' :'';
    return '<tr ' + (counter > 10 ?'class="observerItem" style="display:none"' :'') + '>' +
        '<td title="System-ID: ' + item.id  + '">' + (item.hasOwnProperty("deployment") ?item.deployment.customer.abbreviation :'Keine Zuordnung') + '</td>' +
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
