var _id;
var _display = null;
var _deployments = null;
var _applicationVersion = null;
var _deploymentHistory = null;
$(document).ready(function() {
    _id = getURLParameterByName('id');
    Promise.all(getListOfSystemChecks()).then((data) => {
        systemCheckCompleted(data);
        getDeploymentHistory().then((data)=>setHistory(data), denyHistory);
        getSystemChecks().then((data)=> {
            setThirtyDays(data);
            setErrorLog(data);
            });
        getSystemInfo().then((data) => {
            try { $("#applicationDesign").text('"' + data.presentation.configuration.design.toUpperCase() + '"'); } catch(error) { $("#applicationDesign").text("-"); }
            $("#unknownblackmodus").hide();
            if (data.application.status.running.length === 0) {
                $("#Schwarzbildmodus").prop("checked", true);
                $(".btn_blackmodus").attr("title", "Ist im Schwarzbildmodus");
            } else if (data.application.status.running[0] === "html" || data.application.status.running[0] === "air") {
                $(".btn_blackmodus").attr("title", "Ist nicht im Schwarzbildmodus");
                $("#Schwarzbildmodus").prop("checked", false);
            }
        }, ()=>{
            try {
                if (_display.checkResults[0].applicationState === "html" || _display.checkResults[0].applicationState === "air") {
                    $(".btn_blackmodus").attr("title", "Ist nicht im Schwarzbildmodus");
                    $("#Schwarzbildmodus").prop("checked", false);
                }
            } catch(error) {    }
            $("#applicationDesign").text("-");
            $("#unknownblackmodus").text("(Status: UNBEKANNT)");
        });
    }, ()=>{
        //$("#message").html('<font class="errormsg">System nicht gefunden.</font>');
        $("#errorlog").html("<tr><td>Keine Einträge geladen</td></tr>");
    });
    $('.btn_wireguard').click(function(e) {
        if (_display.hasOwnProperty("pubkey"))
            navigator.clipboard.writeText(_display.pubkey);
		e.preventDefault();
	});
    $('.btn_internetconnection').click(function(e) {
        if ($("#connectionsDropdown").hasClass("show"))
            $("#connectionsDropdown").removeClass("show");
        else
            $("#connectionsDropdown").addClass("show");
		e.preventDefault();
	});
    $('.btn_connection').click(function(e) {
        localStorage.removeItem("servicetool.systemchecks");
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
                //$("#message").html('<font class="errormsg">Bitte geben Sie die Adresse vollständig an.</font>');
                return null;
            }
            setPublicTransport(address).then(() => {
                localStorage.removeItem("servicetool.systemchecks");
                if (address === null) {
                    address = _display.deployment.hasOwnProperty("address") && _display.deployment.address.street !== "Keine Adresse" ?_display.deployment.address.street + " " + _display.deployment.address.houseNumber + ", " + _display.deployment.address.zipCode + " " + _display.deployment.address.city :'<i>Keine Adresse angegeben</i>';
                    $("#publicTransportAddress").html('<span title="' + address + '">' + address.substring(0, 20) + '...</span>');
                } else
                    $("#publicTransportAddress").html('<span title="' + address[0] + " " + address[1] + ", " + address[2] + " " + address[3] + '">' + (address[0] + " " + address[1] + ", " + address[2] + " " + address[3]).substring(0, 20) + '...</span>');
                $("#addressfields").hide();
                $("#pageloader").hide()
            });
        }
		e.preventDefault();
	});
    $('.btn_check').click(function(e) {
        localStorage.removeItem("servicetool.systemchecks");
        if (_display !== null && _display.hasOwnProperty("checkResults") && _display.checkResults.length > 0 && _display.checkResults[0].hasOwnProperty("offlineSince")) {
            Swal.fire({
                title: 'System war offline',
                text: "Dieses System wurde beim letzten Check 'offline' gemessen. Ein Test kann aufgrund fehlender Erreichbarkeit unerwartet lange dauern.",
                showCancelButton: true,
                confirmButtonColor: '#009fe3',
                cancelButtonColor: '#ff821d',
                iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                confirmButtonText: 'Fortsetzen!',
                cancelButtonText: 'Abbrechen',
                buttonsStyling: true
            }).then(function(selection) {
                if (selection.isConfirmed === true)
                    checkSystem().then(setChecks);
            });
        } else
            checkSystem().then(setChecks);
		e.preventDefault();
	});

    $('.btn_deployment').click(function(e) {
        localStorage.removeItem("servicetool.systemchecks");
        if ($("#deploymentsDropdown").hasClass("show"))
            $("#deploymentsDropdown").removeClass("show");
        else if (_deployments === null) {
            $("#pageloader").show();
            getDeployments().then(listDeployments);
        } else
            listDeployments();
		e.preventDefault();
	});
    $('#deploymentsearch').on('input',function(e) {
        listDeployments();
        e.preventDefault();
    });	
    $('.btn_deleteDeployment').click(function(e) {
        localStorage.removeItem("servicetool.systemchecks");
        if (_display !== null && _display.hasOwnProperty("deployment")) {
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
                        _systemChecksPromise = []; // in common
                        Promise.all(getListOfSystemChecks()).then(systemCheckCompleted);
                    });
            });
        }
        e.preventDefault();
	});

    $('.btn_noice').click(function(e) {
        noice().then(()=>{
            $("#pageloader").hide();
            Swal.fire({
                title: 'Erfolg',
                text: "Piep Ton wurde abgespielt.",
                showCancelButton: false,
                confirmButtonColor: '#009fe3',
                iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                confirmButtonText: 'O.K.',
                buttonsStyling: true
            });
        });
		e.preventDefault();
	}); 
    $('.btn_installed').click(function(e) {
        localStorage.removeItem("servicetool.systemchecks");
        setFit().then(()=>{$("#pageloader").hide()});
        if ($('input[name=Verbaut]:checked').val() === 'on')
            $(this).attr("title", "Ist nicht verbaut");
        else
            $(this).attr("title", "Ist verbaut");
	}); 
    $('.btn_blackmodus').click(function(e) {
        localStorage.removeItem("servicetool.systemchecks");
        setApplicationState().then(checkSystem).then(()=>{
            $("#pageloader").hide();
        }, (msg) => {
            if ($("#unknownblackmodus").is(":hidden")) {
                if ($(".btn_blackmodus").attr("title") === "Ist im Schwarzbildmodus") {
                    $(".btn_blackmodus").attr("title", "Ist nicht im Schwarzbildmodus");
                    $("#Schwarzbildmodus").prop("checked", false);
                } else {
                    $("#Schwarzbildmodus").prop("checked", true);
                    $(".btn_blackmodus").attr("title", "Ist im Schwarzbildmodus");
                }
            }
            setErrorMessage(msg, "Schwarzbildmodus des Systems");
        });
        if ($('input[name=Schwarzbildmodus]:checked').val() === 'on')
            $(this).attr("title", "Ist nicht im Schwarzbildmodus");
        else
            $(this).attr("title", "Ist im Schwarzbildmodus");
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
        if (_display !== null && _display.hasOwnProperty("deployment")) {
            localStorage.removeItem("servicetool.systemchecks");
            changeDeployment("testing", $('input[name=Testgerät]:checked').val() !== 'on').then(()=>{$("#pageloader").hide()});
            if ($('input[name=Testgerät]:checked').val() === 'on')
                $(this).attr("title", "Ist kein Testsystem");
            else
                $(this).attr("title", "Ist ein Testsystem");
        }
	});
    $('.btn_screenshot').click(function(e) {
        if (_display !== null && _display.hasOwnProperty("checkResults") && _display.checkResults.length > 0 && _display.checkResults[0].hasOwnProperty("offlineSince")) {
            Swal.fire({
                title: 'System war offline',
                text: "Dieses System wurde beim letzten Check 'offline' gemessen. Ein Screenshot kann aufgrund fehlender Erreichbarkeit unerwartet lange dauern.",
                showCancelButton: true,
                confirmButtonColor: '#009fe3',
                cancelButtonColor: '#ff821d',
                iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                confirmButtonText: 'Fortsetzen!',
                cancelButtonText: 'Abbrechen',
                buttonsStyling: true
            }).then(function(selection) {
                if (selection.isConfirmed === true)
                    window.open('https://sysmon.homeinfo.de/screenshot/' + _id, "_blank"); // http://321.terminals.homeinfo.intra:8000/screenshot (faster)
            });
        } else
            window.open('https://sysmon.homeinfo.de/screenshot/' + _id, "_blank"); // http://321.terminals.homeinfo.intra:8000/screenshot (faster)
        
		e.preventDefault();
	}); 
	$('.btn_eye').click(function(e) {
		let data = {'type':'deployment','id':_display.deployment.id};
		$("#pageloader").show();
		$.ajax({
			url: "https://backend.homeinfo.de/preview/token?customer=" + _display.deployment.customer.id,
			type: "POST",
			data: JSON.stringify(data),
			contentType: 'application/json',
			success: function (msg) {
				window.open('https://cms.homeinfo.de/preview/preview.html?token=' + msg.token, '_blank');
				$("#pageloader").hide();
			},
			error: function (msg) {
				setErrorMessage(msg, "Generieren der Vorschau");
			}
		});
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
    _applicationVersion = data[1];
    let foundsystem = {};
    for (let system in data[0]) {
        if (data[0][system].id == _id) {
            foundsystem = data[0][system];
            break;
        }
    }
    if ($.isEmptyObject(foundsystem))
        getSystem().then(setDetails);
    else
        setDetails(foundsystem);
}
function setDetails(data) {
    _display = data.hasOwnProperty(_id) ?data[_id] :data;
    let address = _display.hasOwnProperty("deployment") ?_display.deployment.hasOwnProperty("address") && _display.deployment.address.street !== "Keine Adresse" ?_display.deployment.address.street + " " + _display.deployment.address.houseNumber + ", " + _display.deployment.address.zipCode + " " + _display.deployment.address.city :'<i>Keine Adresse angegeben</i>' :'<i>Keinem Standort zugewiesen</i>';
    $("#displaytitle").html("Display: " + address);
    try {
        $('#metadescription').attr("content", address);
        $("#sitetitle").text(_display.deployment.customer.company.name + " " + _id);
        $("#completecustomername").html(_display.deployment.customer.company.name + ' (Knr. ' + _display.deployment.customer.id + ')');
    } catch(err) {   }
    // Display Overview
    $("#model").text(_display.hasOwnProperty("model") ?_display.model :'-');
    $("#serialNumber").text(_display.hasOwnProperty("serialNumber") ?_display.serialNumber :'-');
    $("#ipv6").text(_display.ipv6address);
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0) {
        $("#ramtotal").text(_display.checkResults[0].hasOwnProperty("ramTotal") ?parseInt(_display.checkResults[0].ramTotal/1024) + "MB" :"-");
        $("#ramAvailable").text(_display.checkResults[0].hasOwnProperty("ramAvailable") ?parseInt(_display.checkResults[0].ramAvailable/1024) + "MB":"-");
    }
    if (_display.hasOwnProperty("deployment")) {
        $("#screentype").text(_display.deployment.type);
        $("#internetconnection").text(_display.deployment.connection);
        let lptAddress = _display.deployment.hasOwnProperty("lptAddress") ?_display.deployment.lptAddress.street + " " + _display.deployment.lptAddress.houseNumber + ", " + _display.deployment.lptAddress.zipCode + " " + _display.deployment.lptAddress.city :address
        $("#publicTransportAddress").html('<span title="' + lptAddress + '">' + lptAddress.substring(0, 18) + '...</span>');
        $("#deploymentID").text(_display.deployment.id);
        $("#annotation").html(_display.deployment.hasOwnProperty("annotation") ?"<span title='" + _display.deployment.annotation + "'>" + _display.deployment.annotation.substring(0, 20) + "...</span>" :"-");
    }
    $("#wireguard").html(_display.hasOwnProperty("pubkey") ?"<span title='" + _display.pubkey + " (zum Kopieren klicken)'>" + _display.pubkey.substring(0, 20) + "...</span>" :"-");
    $("#systemID").text(_display.id);
    $("#os").text(_display.operatingSystem);

    // Funktionen
    if (_display.fitted) {
        $("#Verbaut").prop("checked", true);
        $(".btn_installed").attr("title", "Ist verbaut");
    } else {
        $("#Verbaut").prop("checked", false);
        $(".btn_installed").attr("title", "Ist nicht verbaut");
    }

    if (_display.hasOwnProperty("deployment") && _display.deployment.testing) {
        $("#Testgerät").prop("checked", true);
        $(".btn_testsystem").attr("title", "Ist ein Testsystem");
    } else {
        $("#Testgerät").prop("checked", false);
        $(".btn_testsystem").attr("title", "Ist kein Testsystem");
    }
    if (_display.hasOwnProperty("deployment")) {
        $(".btn_testsystem").css("opacity", "1");
        $(".btn_testsystem").addClass("pointer");
        $(".btn_testsystem").attr("title", "");
        $(".btn_sync").css("opacity", "1");
        $(".btn_sync").addClass("pointer");
        $(".btn_sync").attr("title", "");
        $(".btn_publictransport").css("opacity", "1");
        $(".btn_publictransport").addClass("pointer");
        $(".btn_publictransport").attr("title", "");
        $(".btn_deleteDeployment").css("opacity", "1");
        $(".btn_deleteDeployment").addClass("pointer");
        $(".btn_deleteDeployment").attr("title", "Deployment lösen");
    } else {
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
        $(".btn_eye").css("opacity", "0.3");
        $(".btn_eye").removeClass("pointer");
        $(".btn_eye").attr("title", "Keine Zuordnung vorhanden");
    }
        
    // Systemchecks
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0)
        setChecks(_display.checkResults[0]);
}

function setChecks(lastCheck) {
    if (isOnDate(lastCheck.timestamp, 24)) {
        $("#systemcheck").html('<span class="blueMark">ok</span>');
        $("#offline").html(lastCheck.hasOwnProperty("offlineSince") || lastCheck.sshLogin !== "success" ?'<span class="orangeMark">offline</span>' :'<span class="blueMark">online</span>');
        $("#sensors").html(lastCheck.sensors === "failed" ?'<span class="orangeMark">overheated</span>' :lastCheck.sensors === "success" ?'<span class="blueMark">ok</span>' :'<span class="blueMark">' + lastCheck.sensors + '</span>');
        $("#root").html(lastCheck.rootNotRo === "failed" ?'<span class="orangeMark">' + lastCheck.rootNotRo + '</span>' :'<span class="blueMark">' + lastCheck.rootNotRo + '</span>');
        $("#ssd").html(lastCheck.smartCheck === "failed" ?'<span class="orangeMark">' + lastCheck.smartCheck + '</span>' :'<span class="blueMark">' + lastCheck.smartCheck + '</span>');
        $("#icmp").html(lastCheck.icmpRequest ?'<span class="blueMark">ok</span>' :'<span class="orangeMark">fehlgeschlagen</span>');
        $("#ssh").html(lastCheck.sshLogin === "failed" ?'<span class="orangeMark">' + lastCheck.sshLogin + '</span>' :'<span class="blueMark">' + lastCheck.sshLogin +'</span>');
        $("#http").html(lastCheck.httpRequest === "failed" ?'<span class="orangeMark">' + lastCheck.httpRequest + '</span>' :'<span class="blueMark">' + lastCheck.httpRequest + '</span>');
        $("#application").html(lastCheck.applicationState === "conflict" || lastCheck.applicationState === "not enabled" || lastCheck.applicationState === "not running"?'<span class="orangeMark">' + lastCheck.applicationState +'</span>' :'<span class="blueMark">' + lastCheck.applicationState + '</span>');
        $("#baytrail").html(lastCheck.baytrailFreeze === "vulnerable" ?'<span class="orangeMark">' + lastCheck.baytrailFreeze + '</span>' :'<span class="blueMark">' + lastCheck.baytrailFreeze + '</span>');
        $("#bootpartition").html(lastCheck.efiMountOk === "failed" ?'<span class="orangeMark">' + lastCheck.efiMountOk + '</span>' :'<span class="blueMark">' + lastCheck.efiMountOk + '</span>');
        $("#download").html(lastCheck.hasOwnProperty("download") ?lastCheck.download*_KIBIBITTOMBIT < 2 ?'<span class="orangeMark">' + (lastCheck.download*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>' :'<span class="blueMark">' + (lastCheck.download*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>' :"-");
        $("#upload").html(lastCheck.hasOwnProperty("upload") ?lastCheck.upload*_KIBIBITTOMBIT < 0.4 ?'<span class="orangeMark">' + (lastCheck.upload*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>' :'<span class="blueMark">' + (lastCheck.upload*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>' :"-");
        $("#applicationuptodate").html(lastCheck.hasOwnProperty("applicationVersion") ?_applicationVersion === lastCheck.applicationVersion ?'<span class="blueMark">' + lastCheck.applicationVersion + '</span>' :'<span title="' + _applicationVersion + '" class="orangeMark">' + lastCheck.applicationVersion + '</span>' :'<span class="blueMark">unsupported</span>');
    } else {
        $("#systemcheck").html('<span class="orangeMark">failed</span>');
        $("#offline").text("-");
        $("#ssd").text("-");
        $("#icmp").text("-");
        $("#ssh").text("-");
        $("#http").text("-");
        $("#application").text("-");
        $("#baytrail").text("-");
        $("#bootpartition").text("-");
        $("#download").text("-");
        $("#upload").text("-");
        $("#applicationuptodate").text("-");
    }
    $("#sync").text(_display.hasOwnProperty("lastSync") ?formatDate(_display.lastSync) + " (" + _display.lastSync.substring(11, 16) + "h)" :"noch nie");
    $("#lastCheck").text("Letzter Check " + formatDate(lastCheck.timestamp) + " (" + lastCheck.timestamp.substring(11, 16) + " Uhr)");
    $("#pageloader").hide();
}

function setErrorLog(display) {
    display = display[_id];
    let logs = "";
    let errorData = {"offline":[], "ssd":[], "baytrail":[], "icmp":[], "ssh":[], "http":[], "application":[]}; // [{"<days>, <timestamp>}]
    let logsData = [];
    if (display.hasOwnProperty("checkResults") && display.checkResults.length > 0) {
        for (let log of display.checkResults) {
            // offline
            if (log.hasOwnProperty("offlineSince")) {
                if (errorData.offline.length === 0)
                    errorData.offline.push({"days":Math.ceil((new Date() - new Date(log.offlineSince)) / 86400000), "timestamp":log.timestamp});
                //else
                    //errorData.offline[errorData.offline.length-1].days++;
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
    if (!display.hasOwnProperty("pubkey")) {
        logs += '<tr>' +
            '<td>WireGuard pubkey nicht gesetzt</td>' +
            '<td></td>' +
        '</tr>';
    }
    //lastSync
    let daysLastSync = Math.ceil((new Date() - new Date(display.lastSync)) / 86400000);
    if (daysLastSync > 1) {
        logs += '<tr>' +
            '<td>Erfolglose Übertragung (' + daysLastSync + ' Tag' + (daysLastSync > 1 ?'e' :'') + ')</td>' +
            '<td></td>' +
        '</tr>';
    }
    logs = logs === "" ?"<tr><td>Keine Einträge vorhanden</td></tr>" :logs;
    $("#errorlog").html(logs);
}

function setHistory(history, page = 1) {
    if (_deploymentHistory === null) {
        _deploymentHistory = [];
        const chunkSize = 10;
        for (let i = 0; i < history.length; i += chunkSize)
            _deploymentHistory.push(history.slice(i, i + chunkSize));
    }
    let historyEntries = "";
    if (_deploymentHistory.length > 0) {
        for (let entry of _deploymentHistory[page-1]) {
            historyEntries += "<tr>" +
                "<td>" + (entry.account.hasOwnProperty("fullName") ?entry.account.fullName :entry.account.name) + "</td>" +
                "<td>Zuordnung: " + (entry.oldDeployment === null ?"keine" :entry.oldDeployment) + "</td>" + // "k.Z." -> " "keine Zuordnung"
                "<td>" + formatDate(entry.timestamp) + " (" + entry.timestamp.substring(11, 16) + "Uhr)</td>" +
            "</tr>";
        }
    }
    historyEntries = historyEntries === "" ?"<tr><td>Keine Einträge vorhanden.</td></tr>" :historyEntries;
    $("#history").html(historyEntries);

    if (_deploymentHistory !== null && _deploymentHistory.length > 1)
        $("#system-pages").show();
    else
        $("#system-pages").hide();
    $("#system-pages").html('<span class="previousPage pointer" data-page="' + page + '"><u><<</u></span> ' + page + ' / ' + _deploymentHistory.length + ' <span class="nextPage pointer" data-page="' + page + '"><u>>></u>');
    $('.nextPage').click(function(e) {
        if (_deploymentHistory !== null) {
            if (parseInt($(this).data("page"))+1 > _deploymentHistory.length)
                setHistory(null, 1);
            else             
                setHistory(null, parseInt($(this).data("page")) + 1);
        }
    });
    $('.previousPage').click(function(e) {
        if (_deploymentHistory !== null) {
            if (parseInt($(this).data("page"))-1 < 1)
                setHistory(null, _deploymentHistory.length);
            else             
                setHistory(null, parseInt($(this).data("page")) - 1);
        }
    });
}
function denyHistory() {
    $("#history").html("<tr><td>History nicht vorhanden</td></tr>");
}
function getDeploymentHistory() {
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

// Systemchecks über 30 Tage
function setThirtyDays(data) {  
    _display = data[_id];
    let date = new Date();
    let dateDay;
    let dateFound;
    let timestamp;
    $("#thirtysystemcheck").html('');
    $("#thirtyoffline").html('');
    $("#thirtyicmp").html('');
    $("#thirtyssh").html('');
    $("#thirtyhttp").html('');
    $("#thirtydownloadupload").html('');    
    for (let day = 0; day < 30; day++) {
        dateFound = false;
        dateDay = (date.getDate() < 10 ?"0" + date.getDate(): date.getDate()) + "." + (date.getMonth() < 9 ?"0" + (date.getMonth()+1) :date.getMonth()+1) + "." + date.getFullYear();
        if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > day) {
            for (let log of _display.checkResults) {
                timestamp = new Date(log.timestamp);
                if (date.getFullYear() === timestamp.getFullYear() && date.getMonth() === timestamp.getMonth() && date.getDate() === timestamp.getDate()) {
                    dateFound = true;
                    $("#thirtysystemcheck").append('<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    $("#thirtyoffline").append(log.hasOwnProperty("offlineSince") || log.sshLogin !== "success" ?'<li data-toggle="tooltip" title="' + dateDay + '" class="orangeSq"></li>' :'<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    $("#thirtyicmp").append(!log.icmpRequest ?'<li data-toggle="tooltip" title="' + dateDay + '" class="orangeSq"></li>' :'<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    $("#thirtyssh").append(log.sshLogin === "failed" ?'<li data-toggle="tooltip" title="' + dateDay + '" class="orangeSq"></li>' :'<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    $("#thirtyhttp").append(log.httpRequest === "failed" ?'<li data-toggle="tooltip" title="' + dateDay + '" class="orangeSq"></li>' :'<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    $("#thirtydownloadupload").append((log.hasOwnProperty("download") && log.download*_KIBIBITTOMBIT < 2) || (log.hasOwnProperty("upload") && log.upload*_KIBIBITTOMBIT < 0.4)?'<li data-toggle="tooltip" title="' + dateDay + '" class="orangeSq"></li>' :'<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    break;
                }
            }
        }
        if (!dateFound) {
            $("#thirtysystemcheck").append('<li data-toggle="tooltip" title="' + dateDay + ': Kein Check durchgeführt" class="orangeSq"></li>');
            $('#thirtyoffline').append('<li data-toggle="tooltip" title="' + dateDay + ': Keine Daten vorhanden" style="height:5px; margin-top:18px"></li>');
            $('#thirtyicmp').append('<li data-toggle="tooltip" title="' + dateDay + ': Keine Daten vorhanden" style="height:5px; margin-top:18px"></li>');
            $('#thirtyssh').append('<li data-toggle="tooltip" title="' + dateDay + ': Keine Daten vorhanden" style="height:5px; margin-top:18px"></li>');
            $('#thirtyhttp').append('<li data-toggle="tooltip" title="' + dateDay + ': Keine Daten vorhanden" style="height:5px; margin-top:18px"></li>');
            $('#thirtydownloadupload').append('<li data-toggle="tooltip" title="' + dateDay + ': Keine Daten vorhanden" style="height:5px; margin-top:18px"></li>');
        }
        date.setDate(date.getDate()-1);
    };
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0 && _display.checkResults[0].httpRequest !== "unsupported")
        $(".thirtyhttp").show();
    else
        $(".thirtyhttp").hide();
        
    $("#thirtyloading").hide();
    $('[data-toggle="tooltip"]').tooltip();
    $("#thirty").show();
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
function getSystemInfo() {
    return $.ajax({
        url: "https://sysmon.homeinfo.de/sysinfo/" + _id,
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Laden der Systeminfos");
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
    };
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
            localStorage.removeItem("servicetool.systemchecks");
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
                        $("#deploymentsDropdown").removeClass("show");
                        _systemChecksPromise = []; // in common
                        setDeployments(id).then(()=>{Promise.all(getListOfSystemChecks()).then(systemCheckCompleted);});
                    }
                });
            } else {
                $("#deploymentsDropdown").removeClass("show");
                _systemChecksPromise = []; // in common
                setDeployments(id).then(()=>{Promise.all(getListOfSystemChecks()).then(systemCheckCompleted);});  
            }
            e.preventDefault();
        });
        $("#deploymentsDropdown").addClass("show");
        $('#deploymentsearch').focus();
        $("#pageloader").hide();
    }
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
        success: function (queue) { },
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
            setErrorMessage(msg, "Neustarten des Systems");
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
            setErrorMessage(msg, 'Systems als "verbaut" zu markieren');
        }
    });  
}
function setApplicationState() {
    $("#pageloader").show();
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/application',
        type: "POST",
        data: JSON.stringify({'system': _id, 'state': $('input[name=Schwarzbildmodus]:checked').val() === 'on'}),
        contentType: 'application/json'
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
	return $.ajax({
		url: "https://backend.homeinfo.de/deployments/" + _display.deployment.id + "?customer=" + _display.deployment.customer.id,
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