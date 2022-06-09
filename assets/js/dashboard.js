$(document).ready(function() {
    Promise.all(getListOfSystemChecks()).then(setChecks);
    getDeployments().then(setDeployments);
    getHipsterStatus().then(setHipsterStatus);
    $('#observercounter').click(function(e) {
        $(".observerItem").show();
		e.preventDefault();
	});
    $('.btn_registration').click(function(e) {
        window.location.href = "bestelltool-list.html";
		e.preventDefault();
	}); 
    $('.btn_hipster').click(function(e) {
        $("#hipsterstatus").css("border-color", "#009fe3");
        $("#hipsterstatus").text("-");
        getHipsterStatus().then(setHipsterStatus);
		e.preventDefault();
	});
});

function setChecks(data) {
    let list = setCheckList(data[0], data[1]);
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
                observerItems.push(getObserveItem(check, "Alte Daten", observerItems.length, " älter als 30 Tage"));
        //}
        if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].applicationState === "not running")
            observerItems.push(getObserveItem(check, "Schwarz-Bildmodus", observerItems.length));
    }

    // Widgets
    let errorsDOM = "";
    for (let item in _commonChecks) {
        if (_commonChecks[item].show && _commonChecks[item].systems.length !== 0) {
            errorsDOM += '<div class="col btn_list pointer" data-id="' + item + '">' +
                '<div class="number_box">' +
                    '<span class="theNumber">' + _commonChecks[item].systems.length + '</span>' +
                    '<h5>' + _commonChecks[item].title + '</h5>' +
                '</div>' +
            '</div>';
        }
    }
    $("#widgets").append(errorsDOM);
    $('.btn_list').click(function(e) {
        window.location.href = "listenansicht.html?type=" + $(this).data("id");
		e.preventDefault();
	}); 

    $("#observations").html(getObserverItems(observerItems));
    if (observerItems.length > 10)
        $("#observercounter").text("Alle " + observerItems.length + " Meldungen anzeigen");
    $("#pageloader").hide();
}

function getObserveItem(item, annotation, counter, title="") {
    let address = item.hasOwnProperty("deployment") ?item.deployment.hasOwnProperty("address") ?item.deployment.address.street + " " + item.deployment.address.houseNumber + ", " + item.deployment.address.zipCode + " " + item.deployment.address.city :'Keine Adresse' :'';
    return '<tr ' + (counter > 10 ?'class="observerItem" style="display:none"' :'') + '>' +
        '<td title="System-ID: ' + item.id  + '">' + (item.hasOwnProperty("deployment") ?item.deployment.customer.abbreviation :'Keine Zuordnung') + '</td>' +
        '<td title="' + address + '">' + address.substring(0, 12) + (address.length > 13 ? '...' :'') +  '</td>' +
        '<td' + (title ==="" ?"" :" title='" + title + "'") + '>' + annotation + '</td>' +
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
function setDeployments(deployments) {
    let orderingsDom = "";
    let address;
    for (let deployment of deployments) {
        if (!deployment.hasOwnProperty("constructionSitePreparationFeedback") || !deployment.hasOwnProperty("internetConnection")) {
            address = deployment.hasOwnProperty("address") ?deployment.address.street + " " + deployment.address.houseNumber + ", " + deployment.address.zipCode + " " + deployment.address.city :'<i>Keine Adresse angegeben</i>';
            orderingsDom += '<tr>' +
                '<td>' + deployment.customer.abbreviation + '</td>' +
                '<td title="' + address + '">' + address.substring(0, 12) + (address.length > 13 ? '...' :'') +  '</td>' +
                '<td><span class="' + (deployment.hasOwnProperty("created") && !isOnDate(deployment.created, 2160) ?"EingeActive" :"") + '">' + (deployment.hasOwnProperty("created") ?formatDate(deployment.created) :"-") + '</span></td>' +
                '<td>' +
                    '<ul class="Umgebung">' +
                        (deployment.hasOwnProperty('constructionSitePreparationFeedback') ?'<li title="Anlage Baustellenvorbeitung (OK)"></li>' :'<li class="active" title="Anlage Baustellenvorbeitung (nicht OK)"></li>') + 
                        (deployment.hasOwnProperty('internetConnection') ?'<li title="Netzbindung (OK)"></li>' :'<li class="active" title="Netzbindung (nicht OK)"></li>') + 
                    '</ul>' +
                '</td>' +
                '<td><a href="bestelltool.html?id=' + deployment.id + '" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>' +
            '</tr>';
        }
    }
    orderingsDom = orderingsDom === "" ?"<tr><td>Keine neuen Standorte gefunden</tr></td>" :orderingsDom;
    $("#registrations").html(orderingsDom);
}
function setHipsterStatus(data) {
    $("#hipsterstatus").css("border-color", data ?"#ff821d" :"#009fe3");
    $("#hipsterstatus").text(data ?"running" :"offline");
    if (data)
        $(".btn_hipster").hide();
    else
        $(".btn_hipster").show();
}
function getHipsterStatus() {
    return $.ajax({
		url: "https://sysmon.homeinfo.de/hipster-status",
		type: "GET",
		success: function (msg) {   },
		error: function (msg) {
			setErrorMessage(msg, "Abrufen des Hipster-Status");
		}
	});   
}