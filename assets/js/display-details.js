const _KIBIBITTOMBIT = 1024/1000/1000;
var _id;
var _display = null;
var _checked = {"btn_installed":false, "btn_blackmodus":false, "btn_testsystem":false};
var _deployments = null;
var _applicationVersion = null;
$(document).ready(function() {
    _id = getURLParameterByName('id');
    getApplicationVersion().then(getSystemChecks).then(systemCheckCompleted);
    getDeploymentHistory().then(setHistory, denyHistory);
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
        if (_display !== null && _display.hasOwnProperty("deployment"))
            changeDeployment("connection", $(this).text()).then(()=>{$("#pageloader").hide()});
		e.preventDefault();
	});
    $('.btn_publictransport').click(function(e) {
        if (_display !== null && _display.hasOwnProperty("deployment")) {
            if ($("#addressfields").is(":visible"))
                $("#addressfields").hide();
            else
                $("#addressfields").show();
        }
		e.preventDefault();
	});
    
    $('.btn_savePublicTransport').click(function(e) {
        if (_display !== null && _display.hasOwnProperty("deployment")) {
            let address = [$("#street").val(), $("#houseNumber").val(), $("#zipCode").val(), $("#city").val()];
            if (address[0].trim() === "" && address[1].trim() === "" && address[2].trim() === "" && address[3].trim() === "") {
                address = null;
            } else if (address[0].trim() === "" || address[1].trim() === "" || address[2].trim() === "" || address[3].trim() === "") {
                $("#message").html('<font class="errormsg">Bitte geben Sie die Adresse vollständig an.</font>');
                return null;
            }
            setPublicTransport(address).then(() => {
                if (address === null)
                    $("#publicTransportAddress").text("-");
                else
                    $("#publicTransportAddress").text(address[0] + " " + address[1] + ", " + address[2] + " " + address[3]);
                $("#addressfields").hide();
                $("#pageloader").hide()
            });
        }
		e.preventDefault();
	});
    $('.btn_check').click(function(e) {
        checkSystem().then(setChecks);
		e.preventDefault();
	});

    $('.btn_deployment').click(function(e) {
        if ($("#deploymentsDropdown").hasClass("show"))
            $("#deploymentsDropdown").removeClass("show");
        else if (_deployments === null)
            getDeployments().then(listDeployments);
        else
            listDeployments();
		e.preventDefault();
	});
    $('#deploymentsearch').on('input',function(e) {
        listDeployments();
        e.preventDefault();
    });	
    $('.btn_deleteDeployment').click(function(e) {
        if (_display !== null &&  _display.hasOwnProperty("deployment")) {
            Swal.fire({
                title: 'Sind Sie sicher?',
                text: "Wollen Sie das System wirklich lösen?",
                showCancelButton: true,
                confirmButtonColor: '#009fe3',
                cancelButtonColor: '#ff821d',
                iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                confirmButtonText: 'Ja, lösen!',
                cancelButtonText: 'Vorgang abbrechen!',
                buttonsStyling: true
            }).then(function(selection) {
                if (selection.isConfirmed === true)
                    setDeployments(null).then(()=>{
                        getSystemChecks().then(systemCheckCompleted);
                        getDeploymentHistory().then(setHistory, denyHistory);
                    });
            });
        }
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
        Swal.fire({
            title: 'Sind Sie sicher?',
            text: "Wollen Sie das System neustarten?",
            showCancelButton: true,
            confirmButtonColor: '#009fe3',
            cancelButtonColor: '#ff821d',
            iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
            confirmButtonText: 'Ja, neustarten!',
            cancelButtonText: 'Vorgang abbrechen!',
            buttonsStyling: true
          }).then(function(selection) {
            if (selection.isConfirmed === true)
                restart().then(()=>{$("#pageloader").hide()});
          })
		e.preventDefault();
	}); 
    $('.btn_testsystem').click(function(e) {
        if (_display !== null && _display.hasOwnProperty("deployment") && _checked.btn_testsystem)
            changeDeployment("testing", $('input[name=Testgerät]:checked').val() !== 'on').then(()=>{$("#pageloader").hide()});
	});
    $('.btn_screenshot').click(function(e) {
        window.open('https://sysmon.homeinfo.de/screenshot/' + _id, "_blank"); // http://321.terminals.homeinfo.intra:8000/screenshot (faster)
		e.preventDefault();
	}); 
    $('.btn_sync').click(function(e) {
        if (_display !== null && _display.hasOwnProperty("deployment"))
            sync().then(()=>{$("#pageloader").hide()});
		e.preventDefault();
	});
});

function getSystemChecks() {
    return $.ajax({
        url: "https://sysmon.homeinfo.de/checks/" + _id,
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Laden der Checklist");
        }
    });
    
}

function systemCheckCompleted(data) {
    if ($.isEmptyObject(data))
        getSystem().then(setDetails);
    else
        setDetails(data);
}
function setDetails(data) {
    _display = data.hasOwnProperty(_id) ?data[_id] :data;
    let address = _display.hasOwnProperty("deployment") ?_display.deployment.hasOwnProperty("address") ?_display.deployment.address.street + " " + _display.deployment.address.houseNumber + ", " + _display.deployment.address.zipCode + " " + _display.deployment.address.city :'<i>Keine Adresse angegeben</i>' :'<i>Keinem Standort zugewiesen</i>';
    $("#displaytitle").html("Display: " + address);
    try {
        $('#metadescription').attr("content", address);
        $("#sitetitle").text(_display.deployment.customer.company.name + " " + _id);
        $("#completecustomername").html(_display.deployment.customer.company.name + ' (Knr. ' + _display.deployment.customer.id + ')');
    } catch(err) {   
        console.log(err)
    }
    // Overview
    $("#model").text(_display.hasOwnProperty("model") ?_display.model :'-');
    $("#serialNumber").text(_display.hasOwnProperty("serialNumber") ?_display.serialNumber :'-');
    $("#ipv6").text(_display.ipv6address);
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0) {
        $("#ram").text(_display.checkResults[0].hasOwnProperty("ramFree") ?_display.checkResults[0].ramFree/1024 + " (" + _display.checkResults[0].ramAvailable/1024 + ") / " + _display.checkResults[0].ramTotal/1024 :"-");
        $("#applicationDesign").text(_display.checkResults[0].hasOwnProperty("design") ?_display.checkResults[0].design :"-");
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
    $("#os").text(_display.operatingSystem);

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
        $(".btn_publictransport").css("opacity", "0.3");
        $(".btn_publictransport").removeClass("pointer");
        $(".btn_publictransport").attr("title", "Keine Zuordnung vorhanden");
        $(".btn_deleteDeployment").css("opacity", "0.3");
        $(".btn_deleteDeployment").removeClass("pointer");
        $(".btn_deleteDeployment").attr("title", "Keine Zuordnung vorhanden");
    }
    _checked = {"btn_installed":true, "btn_blackmodus":true, "btn_testsystem":true};

    // Systemchecks über 30 Tage
    let date = new Date();
    let dateDay;
    let dateFound;
    let timestamp;
    for (let day = 0; day < 30; day++) {
        dateFound = false;
        dateDay = (date.getDate() < 10 ?"0" + date.getDate(): date.getDate()) + "." + (date.getMonth() < 9 ?"0" + (date.getMonth()+1) :date.getMonth()+1) + "." + date.getFullYear();
        if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > day) {
            for (let log of _display.checkResults) {
                timestamp = new Date(log.timestamp);
                if (date.getFullYear() === timestamp.getFullYear() && date.getMonth() === timestamp.getMonth() && date.getDate() === timestamp.getDate()) {
                    dateFound = true;
                    $("#thirtysystemcheck").append('<li title="' + dateDay + '" class="orangeSq"></li>');
                    $("#thirtyoffline").append(log.hasOwnProperty("offlineSince") || log.sshLogin !== "success" ?'<li title="' + dateDay + '" class=""></li>' :'<li title="' + dateDay + '" class="orangeSq"></li>');
                    $("#thirtyicmp").append(!log.icmpRequest ?'<li title="' + dateDay + '" class=""></li>' :'<li title="' + dateDay + '" class="orangeSq"></li>');
                    $("#thirtyssh").append(log.sshLogin === "failed" ?'<li title="' + dateDay + '" class=""></li>' :'<li title="' + dateDay + '" class="orangeSq"></li>');
                    $("#thirtyhttp").append(log.httpRequest === "failed" ?'<li title="' + dateDay + '" class=""></li>' :'<li title="' + dateDay + '" class="orangeSq"></li>');
                    break;
                }
            }
        }
        if (!dateFound) {
            $("#thirtysystemcheck").append('<li title="' + dateDay + ': Keine Daten vorhanden" class=""></li>');
            $('#thirtyoffline').append('<li title="' + dateDay + ': Keine Daten vorhanden" class="orangeSq"></li>');
            $('#thirtyicmp').append('<li title="' + dateDay + ': Keine Daten vorhanden" class="orangeSq"></li>');
            $('#thirtyssh').append('<li title="' + dateDay + ': Keine Daten vorhanden" class="orangeSq"></li>');
            $('#thirtyhttp').append('<li title="' + dateDay + ': Keine Daten vorhanden" class="orangeSq"></li>');
        }
        date.setDate(date.getDate()-1);
    };
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0 && _display.checkResults[0].httpRequest !== "unsupported")
        $(".thirtyhttp").show();
    else
        $(".thirtyhttp").hide();
    $("#pageloader").hide();
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
    $("#bootpartition").html(lastCheck.efiMountOk === "failed" ?'<span class="blueMark">' + lastCheck.efiMountOk + '</span>' :'<span class="orangeMark">' + lastCheck.efiMountOk + '</span>');
    $("#download").html(lastCheck.hasOwnProperty("download") ?lastCheck.download*_KIBIBITTOMBIT < 2 ?'<span class="blueMark">' + (lastCheck.download*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>' :'<span class="orangeMark">' + (lastCheck.download*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>' :"-");
    $("#upload").text(lastCheck.hasOwnProperty("upload") ?(lastCheck.upload*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + " Mbit" :"-")
    $("#applicationuptodate").html(lastCheck.hasOwnProperty("applicationVersion") ?_applicationVersion === lastCheck.applicationVersion ?'<span class="orangeMark">' + lastCheck.applicationVersion + '</span>' :'<span title="' + _applicationVersion + '" class="blueMark">' + lastCheck.applicationVersion + '</span>' :'<span class="orangeMark">unsupported</span>');
    $("#lastCheck").text("Letzter Check " + formatDate(lastCheck.timestamp) + " (" + lastCheck.timestamp.substring(11, 16) + " Uhr)");
    $("#pageloader").hide();
}

function setHistory(history) {
    let historyEntries = "";
    for (let entry of history) {
        historyEntries += "<tr>" +
            "<td>" + (entry.account.hasOwnProperty("fullName") ?entry.account.fullName :entry.account.name) + "</td>" +
            "<td>Zuordnung: " + (entry.oldDeployment === null ?"keine" :entry.oldDeployment) + "</td>" + // "k.Z." -> " "keine Zuordnung"
            "<td>" + formatDate(entry.timestamp) + " (" + entry.timestamp.substring(11, 16) + "Uhr)</td>" +
        "</tr>";
    }
    historyEntries = historyEntries === "" ?"<tr><td>Keine Einträge vorhanden.</td></tr>" :historyEntries;
    $("#history").html(historyEntries);

}
function denyHistory() {
    $("#history").html("<tr><td>History nicht vorhanden</td></tr>");
}
function getDeploymentHistory() {
    $("#pageloader").show();
    return $.ajax({
        url: "https://termgr.homeinfo.de/deployment-history/" + _id,
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            if (msg.responseText !== "No such system.")
                setErrorMessage(msg, "Anzeigen der History");
        }
    });
}
function getSystem() {
    return $.ajax({
        url: "https://termgr.homeinfo.de/list/systems/" + _id,
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Anzeigen des Systems");
        }
    });
}
function checkSystem() {
    $("#pageloader").show();
    return $.ajax({
        url: "https://sysmon.homeinfo.de/check/" + _id,
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Checken des Systems");
        }
    });
}

function listDeployments(deployments = null) {
    if (deployments !== null) {
        _deployments = deployments;
        _deployments.sort(function(a, b) {
            //return a.systems.length > 0 ?1 :b.systems.length > 0 ?-1 :0;
            return compare(a.address.street, b.address.street);
        });
    }10
    if (_deployments !== null) {
        let deploymentList = "";
        let address;
        for (let item of _deployments) {
            address = item.hasOwnProperty("address") ?item.address.street + " " + item.address.houseNumber + ", " + item.address.zipCode + " " + item.address.city :'<i>Keine Adresse angegeben</i>';
            if (address.toLowerCase().indexOf($('#deploymentsearch').val().toLowerCase()) !== -1 || item.customer.id.toString().indexOf($('#deploymentsearch').val()) !== -1 || (item.customer.hasOwnProperty("abbreviation") && item.customer.abbreviation.toString().toLowerCase().indexOf($('#deploymentsearch').val()) !== -1) || item.customer.company.name.toString().toLowerCase().indexOf($('#deploymentsearch').val()) !== -1 || item.id.toString().indexOf($('#deploymentsearch').val()) !== -1) 
                deploymentList += '<li><a class="dropdown-item btn_addDeployment" data-id="' + item.id + '" data-used="' + (item.systems.length > 0 ?"true" :false) + '" title="' + item.id + '"href="#">' + address + ' (' + item.systems.length + ')</a></li>';
        }
        $('.btn_addDeployment').parent().remove();
        $("#deploymentsDropdown").append(deploymentList);
        $('.btn_addDeployment').click(function(e) {
            let id = $(this).data("id");
            if ($(this).data("used") == true) {
                Swal.fire({
                    title: 'Dieser Standort wird bereits genutzt',
                    text: "Wollen Sie das System dennoch zuweisen?",
                    showCancelButton: true,
                    confirmButtonColor: '#009fe3',
                    cancelButtonColor: '#ff821d',
                    iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                    confirmButtonText: 'Ja, zuweisen!',
                    cancelButtonText: 'Vorgang abbrechen!',
                    buttonsStyling: true
                }).then(function(selection) {
                    if (selection.isConfirmed === true) {
                        setDeployments(id).then(()=>{
                            $("#deploymentsDropdown").removeClass("show");
                            getSystemChecks().then(systemCheckCompleted);
                            getDeploymentHistory().then(setHistory, denyHistory);
                        });
                    }
                });
            } else {
                setDeployments(id).then(()=>{
                    $("#deploymentsDropdown").removeClass("show");
                    getSystemChecks().then(systemCheckCompleted);
                    getDeploymentHistory().then(setHistory, denyHistory);
                });  
            }
            e.preventDefault();
        });
        $("#deploymentsDropdown").addClass("show");
        $('#deploymentsearch').focus();
        $("#pageloader").hide();
    }
}
function getDeployments() {
    $("#pageloader").show();
    return $.ajax({
        url: "https://termgr.homeinfo.de/list/deployments",
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Listen der Standorte");
        }
    });
}
function setDeployments(deployment, exclusive = false) {
    $("#pageloader").show();
    const data = {
        'system': _id,
        'deployment':deployment,
        'exclusive': false
    };
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/deploy',
        type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Zuweisen des Stanortes");
        }
    });
}
function sync() {
    $("#pageloader").show();
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/sync', //"https://hipster.homeinfo.de?customer=" + _display.deployment.customer.id,
        type: "POST",
        data: JSON.stringify({'system': _id}),
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
        data: JSON.stringify({'system': _id}),
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
        data: JSON.stringify({'system': _id}),
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
        data: JSON.stringify({'system': _id, 'fitted': $('input[name=Verbaut]:checked').val() !== 'on'}),
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
        data: JSON.stringify({'system': _id, 'state': $('input[name=Schwarzbildmodus]:checked').val() !== 'on'}),
        contentType: 'application/json',
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Piepen des Systems");
        }
    });  
}
function setPublicTransport(address) {
    $("#pageloader").show();
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/lpt-address/' + _display.deployment.id,
        type: "POST",
        data: JSON.stringify(address),
        contentType: 'application/json',
        success: function (msg) {   },
        error: function (msg) {
            setErrorMessage(msg, "Durchführen der ÖPNV-Änderung");
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
function getApplicationVersion() {
	return $.ajax({
		url: "https://sysmon.homeinfo.de/current-application-version/html",
		type: "GET",
		cache: false,
		success: function (data) {
            _applicationVersion = data;
		},
		error: function (msg) {
			setErrorMessage(msg, "Abrufen der Applicationsversion");
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