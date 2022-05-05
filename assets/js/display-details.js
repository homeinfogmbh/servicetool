var _display = null;
$(document).ready(function() {
	getSystemChecks().then(setDetails);
    $('.whitelineBtn').click(function(e) {
        $("#pageloader").show();
        checkSystem(_display.id).then(setChecks);
		e.preventDefault();
	});
    $('.btn_screenshot').click(function(e) {
        window.open('https://sysmon.homeinfo.de/screenshot/' + _display.id, "_blank"); // http://321.terminals.homeinfo.intra:8000/screenshot (faster)
		e.preventDefault();
	}); 
    
});

function getSystemChecks() {
    return $.ajax({
        url: "https://sysmon.homeinfo.de/checks/" + getURLParameterByName('id'),
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Laden der Checklist");
        }
    });
    
}

function setDetails(data) {
    _display = data[getURLParameterByName('id')];
    console.log(_display)
    let address = _display.hasOwnProperty("deployment") ?_display.deployment.hasOwnProperty("address") ?_display.deployment.address.street + " " + _display.deployment.address.houseNumber + " " + _display.deployment.address.zipCode + " " + _display.deployment.address.city :'<i>Keine Adresse angegeben</i>' :'<i>Keinen Standort zugewiesen</i>';
    $("#displaytitle").html("Display: " + address);
    try { $("#completecustomername").html(_display.deployment.customer.company.name); } catch(err) {   }
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
            // offlineSince
           if (log.hasOwnProperty("offlineSince")) {
                logs += '<tr>' +
                    '<td>Nicht Online (' + Math.ceil(1 + (new Date(log.timestamp) - new Date(log.offlineSince)) / 86400000) + ' Tage)</td>' + // Days
                    '<td>' + formatDate(log.timestamp) + '</td>' +
                '</tr>';
           }
        }
        logs = logs === "" ?"<tr><td>Keine Einträge vorhanden</td></tr>" :logs;
       $("#errorlog").html(logs);
    }

    // Systemchecks
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0)
        setChecks(_display.checkResults[0]);

    // Systemchecks über 30 Tage
    for (let log of _display.checkResults) {
        $('#thirtyoffline').append('<li class=""></li>');
        $('#thirtysync').append('<li class=""></li>');
        $('#thirtyicmp').append('<li class=""></li>');
        $('#thirtyssh').append('<li class=""></li>');
        $('#thirtyhttp').append('<li class=""></li>');
        //<li class="orangeSq"></li>
    }
}

function setChecks(lastCheck) {
    $("#offline").html(lastCheck.hasOwnProperty("offlineSince") || lastCheck.sshLogin !== "success" ?'<span class="blueMark">offline</span>' :'<span class="orangeMark">online</span>');
    $("#ssd").html(lastCheck.smartCheck === "failed" ?'<span class="blueMark">' + lastCheck.smartCheck + '</span>' :'<span class="orangeMark">' + lastCheck.smartCheck + '</span>');
    $("#sync").text(_display.hasOwnProperty("lastSync") ?formatDate(_display.lastSync) + " (" + _display.lastSync.substring(11, 16) + "h)" :"noch nie");
    $("#icmp").html(lastCheck.icmpRequest ?'<span class="orangeMark">ok</span>' :'<span class="blueMark">fehlgeschlagen</span>');
    $("#ssh").html(lastCheck.sshLogin === "failed" ?'<span class="blueMark">' + lastCheck.sshLogin + '</span>' :'<span class="orangeMark">' + lastCheck.sshLogin +'</span>');
    $("#http").html(lastCheck.httpRequest === "failed" ?'<span class="blueMark">' + lastCheck.httpRequest + '</span>' :'<span class="orangeMark">' + lastCheck.httpRequest + '</span>');
    $("#application").html(lastCheck.applicationState === "conflict" || lastCheck.applicationState === "not enabled" || lastCheck.applicationState === "not running"?'<span class="blueMark">' + lastCheck.applicationState +'</span>' :'<span class="orangeMark">' + lastCheck.applicationState + '</span>');
    $("#baytrail").html(lastCheck.baytrailFreeze === "vulnerable" ?'<span class="blueMark">' + lastCheck.baytrailFreeze + '</span>' :'<span class="orangeMark">' + lastCheck.baytrailFreeze + '</span>');
    $("#applicationuptodate").html('<span class="orangeMark">TODO</span>');
    $("#lastCheck").text("Letzter Check " + formatDate(lastCheck.timestamp) + " (" + lastCheck.timestamp.substring(11, 16) + " Uhr)");
    $("#pageloader").hide();
}
/*
class ApplicationState(str, Enum):
    AIR = 'air'
    HTML = 'html'
    CONFLICT = 'conflict'
    NOT_ENABLED = 'not enabled'
    NOT_RUNNING = 'not running'
    UNKNOWN = 'unknown'
class BaytrailFreezeState(str, Enum):
    NOT_AFFECTED = 'not affected'
    MITIGATED = 'mitigated'
    VULNERABLE = 'vulnerable'
    UNKNOWN = 'unknown'
class State(str, Enum):
    RECOVERED = 'recovered'
    FAILED = 'failed'
    UNCHANGED = 'unchanged'
class SuccessFailedUnsupported(str, Enum):
    SUCCESS = 'success'
    FAILED = 'failed'
    UNSUPPORTED = 'unsupported'
*/