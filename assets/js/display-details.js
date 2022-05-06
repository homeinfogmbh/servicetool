var _display = null;
var _checked = {"btn_installed":false, "btn_blackmodus":false, "btn_testsystem":false};
$(document).ready(function() {
	getSystemChecks().then(setDetails);
    $('.btn_internetconnection').click(function(e) {
        if ($("#connectionsDropdown").hasClass("show"))
            $("#connectionsDropdown").removeClass("show");
        else
            $("#connectionsDropdown").addClass("show");
		e.preventDefault();
	});
    $('.btn_connection').click(function(e) {
        $("#connectionsDropdown").removeClass("show");
        $("#internetconnection").text($(this).text());
        if (_display.hasOwnProperty("deployment"))
            changeDeployment("connection", $(this).text()).then(()=>{$("#pageloader").hide()});
		e.preventDefault();
	});
    
    $('.btn_publictransport').click(function(e) {
        if (_display.hasOwnProperty("deployment"))
            changeDeployment("lptAddress", ["Teststraße", "7", "123456", "Teststadt"]).then(()=>{$("#pageloader").hide()});
		e.preventDefault();
	});
    $('.whitelineBtn').click(function(e) {
        checkSystem().then(setChecks);
		e.preventDefault();
	});
    $('.btn_noice').click(function(e) {
        noice().then(()=>{$("#pageloader").hide()});
		e.preventDefault();
	}); 
    $('.btn_installed').click(function(e) {
        if (_checked.btn_installed)
            setFit().then(()=>{$("#pageloader").hide()});
	}); 
    $('.btn_blackmodus').click(function(e) {
        if (_checked.btn_blackmodus)
         setApplicationState().then(()=>{$("#pageloader").hide()});
	}); 
    $('.btn_restart').click(function(e) {
        restart().then(()=>{$("#pageloader").hide()});
		e.preventDefault();
	}); 
    $('.btn_testsystem').click(function(e) {
        if (_display.hasOwnProperty("deployment") && _checked.btn_testsystem)
            changeDeployment("testing", $('input[name=Testgerät]:checked').val() !== 'on').then(()=>{$("#pageloader").hide()});
	});
    $('.btn_screenshot').click(function(e) {
        window.open('https://sysmon.homeinfo.de/screenshot/' + _display.id, "_blank"); // http://321.terminals.homeinfo.intra:8000/screenshot (faster)
		e.preventDefault();
	}); 
    $('.btn_ping').click(function(e) {
        
		e.preventDefault();
	}); 
    $('.btn_sync').click(function(e) {
        if (_display.hasOwnProperty("deployment"))
            sync().then(()=>{$("#pageloader").hide()});
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
    try { $("#completecustomername").html(_display.deployment.customer.company.name + ' (' + _display.deployment.customer.id + ')'); } catch(err) {   }
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
        $("#deploymentID").text(_display.deployment.id);
        $("#annotation").html(_display.deployment.hasOwnProperty("annotation") ?_display.deployment.annotation :"-");
    }
    $("#wireguard").html(_display.hasOwnProperty("pubkey") ?"<span title='" + _display.pubkey + "'>" + _display.pubkey.substring(0, 20) + " " + _display.pubkey.substring(20) + "</span>" :"-");
    $("#systemID").text(_display.id);
    $("#root").text("TODO");
    $("#os").text(_display.operatingSystem);
    $("#applicationDesign").text("TODO");
    $("#applicationVersion").text("TODO");

    // Error Log
    let logs = "";
    let errorData = {"offline":[], "ssd":[], "baytrail":[], "icmp":[], "ssh":[], "http":[], "application":[]}; // [{"<days>, <timestamp>}]
    let logsData = [];
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0) {
        for (let log of _display.checkResults) {
            // offline
            if (log.hasOwnProperty("offlineSince")) {
                if (errorData.offline.length === 0)
                    errorData.offline.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.offline[errorData.offline.length-1].days++;
            } else if (errorData.offline.length > 0)
                logsData.push({"title":"Nicht Online", "timestamp":errorData.offline[errorData.offline.length-1].timestamp, "days":errorData.offline.pop().days});
            // ssd
            if (log.smartCheck === "failed") {
                if (errorData.ssd.length === 0)
                    errorData.ssd.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.ssd[errorData.ssd.length-1].days++;
            } else if (errorData.ssd.length > 0)
                logsData.push({"title":"SSD-Karten Fehler", "timestamp":errorData.ssd[errorData.ssd.length-1].timestamp, "days":errorData.ssd.pop().days});
            // baytrail
            if (log.baytrailFreeze === "vulnerable") {
                if (errorData.baytrail.length === 0)
                    errorData.baytrail.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.baytrail[errorData.baytrail.length-1].days++;
            } else if (errorData.baytrail.length > 0)
                logsData.push({"title":"Baytrail Fehler", "timestamp":errorData.baytrail[errorData.baytrail.length-1].timestamp, "days":errorData.baytrail.pop().days});
            // icmp
            if (!log.icmpRequest) {
                if (errorData.icmp.length === 0)
                    errorData.icmp.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.icmp[errorData.icmp.length-1].days++;
            } else if (errorData.icmp.length > 0)
                logsData.push({"title":"ICMP-Request Fehler", "timestamp":errorData.icmp[errorData.icmp.length-1].timestamp, "days":errorData.icmp.pop().days});
            // ssh
            if (log.sshLogin === "failed") {
                if (errorData.ssh.length === 0)
                    errorData.ssh.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.ssh[errorData.ssh.length-1].days++;
            } else if (errorData.ssh.length > 0)
                logsData.push({"title":"SSH Fehler", "timestamp":errorData.ssh[errorData.ssh.length-1].timestamp, "days":errorData.ssh.pop().days});
            // http
            if (log.httpRequest === "failed") {
                if (errorData.http.length === 0)
                    errorData.http.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.http[errorData.http.length-1].days++;
            } else if (errorData.http.length > 0)
                logsData.push({"title":"HTTP-Request Fehler", "timestamp":errorData.http[errorData.http.length-1].timestamp, "days":errorData.http.pop().days});
            // application
            if (log.applicationState === "conflict" || log.applicationState === "not enabled" || log.applicationState === "not running") {
                if (errorData.application.length === 0)
                    errorData.application.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.application[errorData.application.length-1].days++;
            } else if (errorData.application.length > 0)
                logsData.push({"title":"Application Status Fehler", "timestamp":errorData.application[errorData.application.length-1].timestamp, "days":errorData.application.pop().days});
        }
        if (errorData.offline.length > 0)
            logsData.push({"title":"Nicht Online", "timestamp":errorData.offline[errorData.offline.length-1].timestamp, "days":errorData.offline.pop().days});
        if (errorData.ssd.length > 0)
            logsData.push({"title":"SSD-Karten Fehler", "timestamp":errorData.ssd[errorData.ssd.length-1].timestamp, "days":errorData.ssd.pop().days});
        if (errorData.baytrail.length > 0)
            logsData.push({"title":"Baytrail Fehler", "timestamp":errorData.baytrail[errorData.baytrail.length-1].timestamp, "days":errorData.baytrail.pop().days});
        if (errorData.icmp.length > 0)
            logsData.push({"title":"ICMP-Request Fehler", "timestamp":errorData.icmp[errorData.icmp.length-1].timestamp, "days":errorData.icmp.pop().days});
        if (errorData.ssh.length > 0)
            logsData.push({"title":"SSH Fehler", "timestamp":errorData.ssh[errorData.ssh.length-1].timestamp, "days":errorData.ssh.pop().days});
        if (errorData.http.length > 0)
            logsData.push({"title":"HTTP-Request Fehler", "timestamp":errorData.http[errorData.http.length-1].timestamp, "days":errorData.http.pop().days});
        if (errorData.application.length > 0)
            logsData.push({"title":"Application Status Fehler", "timestamp":errorData.application[errorData.application.length-1].timestamp, "days":errorData.application.pop().days});
        logsData.sort(function(a, b) {
            return compare(a.timestamp, b.timestamp);
        });
        for (let log of logsData) {
            logs += '<tr>' +
                '<td>' + log.title + ' (' + log.days + ' Tag' + (log.days > 1 ?'e' :'') + ')</td>' +
                '<td>' + formatDate(log.timestamp) + '</td>' +
            '</tr>';
        }
    }
    // "Keinen Standort"
    if (!_display.hasOwnProperty("deployment")) {
        logs += '<tr>' +
            '<td>Keinen Standort</td>' +
            '<td></td>' +
        '</tr>';
    }
    if (!_display.hasOwnProperty("pubkey")) {
        logs += '<tr>' +
            '<td>WireGuard pubkey nicht gesetzt</td>' +
            '<td></td>' +
        '</tr>';
    }
    //lastSync
    let daysLastSync = Math.ceil((new Date() - new Date(_display.lastSync)) / 86400000);
    if (daysLastSync > 1) {
        logs += '<tr>' +
            '<td>Erfolglose Übertragung (' + daysLastSync + ' Tag' + (daysLastSync > 1 ?'e' :'') + ')</td>' +
            '<td></td>' +
        '</tr>';
    }
    logs = logs === "" ?"<tr><td>Keine Einträge vorhanden</td></tr>" :logs;
    $("#errorlog").html(logs);

    // Systemchecks
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0)
        setChecks(_display.checkResults[0]);

    // Funktionen
    if (_display.fitted)
        $(".btn_installed").click();
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0 && (_display.checkResults[0].applicationState === "html" || _display.checkResults[0].applicationState === "air"))
        $(".btn_blackmodus").click();
    if (_display.hasOwnProperty("deployment") && _display.deployment.testing)
        $(".btn_testsystem").click();
    if (!_display.hasOwnProperty("deployment")) {
        $(".btn_testsystem").css("opacity", "0.3");
        $(".btn_testsystem").removeClass("pointer");
        $(".btn_testsystem").attr("title", "Keine Zuordnung vorhanden");
        $(".btn_sync").css("opacity", "0.3");
        $(".btn_sync").removeClass("pointer");
        $(".btn_sync").attr("title", "Keine Zuordnung vorhanden");
    }
    _checked = {"btn_installed":true, "btn_blackmodus":true, "btn_testsystem":true};

    // Systemchecks über 30 Tage
    let daysCounter = 0;
    for (let log of _display.checkResults) {
        daysCounter++;
        $("#thirtyoffline").append(log.hasOwnProperty("offlineSince") || log.sshLogin !== "success" ?'<li title="' + formatDate(log.timestamp) + '" class=""></li>' :'<li title="' + formatDate(log.timestamp) + '" class="orangeSq"></li>');
        $("#thirtysync").append(false ?'<li title="' + formatDate(log.timestamp) + '" class=""></li>' :'<li title="' + formatDate(log.timestamp) + '" class="orangeSq"></li>');
        $("#thirtyicmp").append(!log.icmpRequest ?'<li title="' + formatDate(log.timestamp) + '" class=""></li>' :'<li title="' + formatDate(log.timestamp) + '" class="orangeSq"></li>');
        $("#thirtyssh").append(log.sshLogin === "failed" ?'<li title="' + formatDate(log.timestamp) + '" class=""></li>' :'<li title="' + formatDate(log.timestamp) + '" class="orangeSq"></li>');
        $("#thirtyhttp").append(log.httpRequest === "failed" ?'<li title="' + formatDate(log.timestamp) + '" class=""></li>' :'<li title="' + formatDate(log.timestamp) + '" class="orangeSq"></li>');
    }
    for (let day = 0; day < 30-daysCounter; day++) {
        $('#thirtyoffline').append('<li title="keine Daten vorhanden" class="orangeSq"></li>');
        $('#thirtysync').append('<li title="keine Daten vorhanden" class="orangeSq"></li>');
        $('#thirtyicmp').append('<li title="keine Daten vorhanden" class="orangeSq"></li>');
        $('#thirtyssh').append('<li title="keine Daten vorhanden" class="orangeSq"></li>');
        $('#thirtyhttp').append('<li title="keine Daten vorhanden" class="orangeSq"></li>');
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

function checkSystem() {
    $("#pageloader").show();
    return $.ajax({
        url: "https://sysmon.homeinfo.de/check/" + _display.id,
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Checken des Systems");
        }
    });
}
function sync() {
    $("#pageloader").show();
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/sync', //"https://hipster.homeinfo.de?customer=" + _display.deployment.customer.id,
        type: "POST",
        data: JSON.stringify({'system': _display.id}),
        contentType: 'application/json',
        success: function (queue) {
            console.log(queue);
        },
        error: function (msg) {
            setErrorMessage(msg, "Durchführen der Synchronisation");
        }
    });
}
function noice() {
    $("#pageloader").show();
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/beep',
        type: "POST",
        data: JSON.stringify({'system': _display.id}),
        contentType: 'application/json',
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Piepen des Systems");
        }
    });
}
function restart() {
    $("#pageloader").show();
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/reboot',
        type: "POST",
        data: JSON.stringify({'system': _display.id}),
        contentType: 'application/json',
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Piepen des Systems");
        }
    });
}
function setFit() {
    $("#pageloader").show();
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/fit',
        type: "POST",
        data: JSON.stringify({'system': _display.id, 'fitted': $('input[name=Verbaut]:checked').val() !== 'on'}),
        contentType: 'application/json',
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Piepen des Systems");
        }
    });  
}
function setApplicationState() {
    $("#pageloader").show();
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/application',
        type: "POST",
        data: JSON.stringify({'system': _display.id, 'state': $('input[name=Schwarzbildmodus]:checked').val() !== 'on'}),
        contentType: 'application/json',
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Piepen des Systems");
        }
    });  
}

function changeDeployment(key, value) {
    $("#pageloader").show();
	let deployment = {};
    deployment[key] = value;
    /*
	if ($('#deploymentdescription').val().trim() != "")
		deployment.annotation = $('#deploymentdescription').val();
	if ($('#deploymentstreet').val().trim() != "" || $('#deploymenthousenumber').val().trim() != "" || $('#deploymentzipcode').val().trim() != "" || $('#deploymentcity').val().trim() != "")
		deployment.address = {"street":$('#deploymentstreet').val(), "houseNumber":$('#deploymenthousenumber').val(), "zipCode":$('#deploymentzipcode').val(), "city":$('#deploymentcity').val()};
	deployment.testing = $("input[name='deploymenttesting']:checked").val() === 'true' ?true :false;
	deployment.connection = $("input[name='deploymentconnection']:checked").val();
	deployment.type = $("input[name='deploymenttype']:checked").val();
	deployment.systems = [];
    */
	return $.ajax({
		url: "https://backend.homeinfo.de/deployments/" + _display.deployment.id,
		type: "PATCH",
		cache: false,
		contentType: 'application/json',
		data: JSON.stringify(deployment),
		success: function (data) {
		},
		error: function (msg) {
			setErrorMessage(msg, "Ändern eines Deployments");
		}
	});
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