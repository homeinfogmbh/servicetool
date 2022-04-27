var _display = null;
$(document).ready(function() {
    getListOfSystemChecks().then(setDetails);
    $('.whitelineBtn').click(function(e) {
        $("#pageloader").show();
        checkSystem(_display.id).then(setChecks);
		e.preventDefault();
	});
    
});

function setDetails(list) {
    let id = getURLParameterByName('id');
    for (let check in list) {
        if (parseInt(id) === list[check].id) {
            _display = list[check];
            break;
        }
    }

console.log(_display)
    let address = _display.hasOwnProperty("deployment") ?_display.deployment.hasOwnProperty("address") ?_display.deployment.address.street + " " + _display.deployment.address.houseNumber + " " + _display.deployment.address.zipCode + " " + _display.deployment.address.city :'<i>Keine Adresse angegeben</i>' :'<i>Keinen Standort zugewiesen</i>';
    $("#displaytitle").html("Display: " + address);
    // Overview
    $("#serialNumber").text(_display.hasOwnProperty("serialNumber") ?_display.serialNumber :'-');
    $("#ipv6").text(_display.ipv6address);
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0) {
        $("#ram").text(_display.checkResults[0].hasOwnProperty("ramFree") ?_display.checkResults[0].ramFree/1024 + " (" + _display.checkResults[0].ramAvailable/1024 + ") / " + _display.checkResults[0].ramTotal/1024 :"-");
    }
    if (_display.hasOwnProperty("deployment")) {
        $("#screentype").text(_display.deployment.type);
        $("#internetconnection").text(_display.deployment.connection);
        $("#publicTransportAddress").text(_display.deployment.hasOwnProperty("lptAddress") ?_display.deployment.lptAddress :"-");
    }
    $("#wireguard").html(_display.hasOwnProperty("pubkey") ?"<span title='" + _display.pubkey + "'>" + _display.pubkey.substring(0, 20) + " " + _display.pubkey.substring(20) + "</span>" :"-");
    $("#systemID").text(_display.id);
    $("#root").text("TODO");
    $("#os").text(_display.operatingSystem);
    $("#applicationDesign").text("TODO");
    $("#applicationVersion").text("TODO");

    // Error Log
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0) {
        let logs = "";
        for (let log of _display.checkResults) {
            logs += '<tr>' +
                '<td>Nicht Online (' + Math.floor((new Date() - new Date(log.offlineSince)) / 86400000) + ' Tage)</td>' + // Days
                '<td>' + formatDate(log.timestamp) + '</td>' +
            '</tr>';
        }
       $("#errorlog").html(logs);
    }


    // Systemchecks
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0)
        setChecks(_display.checkResults[0]);
    
}

function setChecks(lastCheck) {
    $("#offline").html(lastCheck.hasOwnProperty("offlineSince") || lastCheck.sshLogin !== "success" ?'<span class="orangeMark">offline</span>' :'<span class="blueMark">online</span>');
    $("#ssd").html(lastCheck.smartCheck === "success" ?'<span class="blueMark">' + lastCheck.smartCheck + '</span>' :'<span class="orangeMark">' + lastCheck.smartCheck + '</span>');
    $("#sync").text(formatDate(_display.lastSync) + " " + lastCheck.timestamp.substring(12, 16));
    $("#icmp").html(lastCheck.icmpRequest ?'<span class="blueMark">ok</span>' :'<span class="orangeMark">fehlgeschlagen</span>');
    $("#ssh").html(lastCheck.sshLogin === "success" ?'<span class="blueMark">' + lastCheck.sshLogin + '</span>' :'<span class="orangeMark">' + lastCheck.sshLogin +'</span>');
    $("#http").html(lastCheck.httpRequest === "success" ?'<span class="blueMark">' + lastCheck.httpRequest + '</span>' :'<span class="orangeMark">' + lastCheck.httpRequest + '</span>');
    $("#application").html(lastCheck.applicationState === "html" ?'<span class="blueMark">running</span>' :'<span class="orangeMark">' + lastCheck.applicationState + '</span>');
    $("#baytrail").html(lastCheck.baytrailFreeze === "vulnerable" ?'<span class="orangeMark">' + lastCheck.baytrailFreeze + '</span>' :'<span class="blueMark">' + lastCheck.baytrailFreeze + '</span>');
    $("#applicationuptodate").html('<span class="orangeMark">TODO</span>');
    $("#lastCheck").text("Letzter Check " + formatDate(lastCheck.timestamp) + " (" + lastCheck.timestamp.substring(12, 16) + " Uhr)");
    $("#pageloader").hide();
}