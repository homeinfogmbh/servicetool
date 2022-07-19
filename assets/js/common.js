const ONE_HOUR = 60 * 60 * 1000; // Milliseconds;
const THREE_MONTHS = 3 * 30 * 24; // Hours
const _KIBIBITTOMBIT = 1024/1000/1000;
var _commonChecks = {"offline":{"title":"Offline", "text":"Liste der Geräte die offline sind", "systems":[], "show":true},
	"offlineThreeMonth":{"title":"Offline mehr als 3 Monate", "text":"Liste der Geräte die länger als 3 Monate ausgefallen sind", "systems":[], "show":true},
	"noDeployment":{"title":"Systeme ohne Zuordnung", "text":"Liste der Geräte die keine Zuordnung besitzen", "systems":[], "show":true},
	"ssd":{"title":"SSD Karten Fehler", "text":"Liste der Geräte die einen SSD-Karten-Fehler aufweisen", "systems":[], "show":true},
	"noActualData":{"title":"Keine aktuellen Daten", "text":"Liste der Geräte die keine aktuellen Daten besitzen", "systems":[], "show":true},
	"appRunning":{"title":"APP running", "text":"Liste aller Systeme auf dem die App nicht läuft", "systems":[], "show":true},
	"blackscreen":{"title":"Im Schwarzbild-Modus", "text":"Liste der Geräte die schwarz geschaltet sind", "systems":[], "show":true},
	"ramfree":{"title":"Geringer verfügbarer Speicher", "text":"Liste der Geräte die weniger als 1/4 des Speichers freihaben", "systems":[], "show":true},
	"ram":{"title":"Zu wenig RAM verbaut", "text":"Liste der Geräte die wenige als 2 GB RAM aufweisen", "systems":[], "show":true},
 	"notfitted":{"title":"Nicht verbaute Displays", "text":"Liste der Geräte die nicht verbaut sind", "systems":[], "show":true},
	"testsystem":{"title":"Testgeräte", "text":"Liste der Testgeräte", "systems":[], "show":true},
	//"oldApplication":{"title":"Alte Applicationen", "text":"Liste der Geräte auf denen eine alte Version der Applikation läuft", "systems":[], "show":true},
	"systemchecksFailed":{"title":"Systemchecks fehlgeschlagen", "text":"Liste der Geräte die länger als 48h nicht überprüft werden konnten", "systems":[], "show":true},
	"air":{"title":"AIR Systeme", "text":"Liste der Geräte die noch die AIR-Application laufen haben", "systems":[], "show":true},
	"sensors":{"title":"Sensoren fehlerhaft", "text":"Liste der Geräte mit fehlerhaften Sensoren", "systems":[], "show":true},
	"root":{"title":"Kein root", "text":"Liste der Geräte ohne root-Anmeldung", "systems":[], "show":true},
	"wireguard":{"title":"Kein Wireguard", "text":"Liste aller Systeme ohne Wireguard", "systems":[], "show":true},
	"downloadUpload":{"title":"Download/Upload kritisch", "text":"Liste aller Systeme, deren Downloadrate unter 2,0 Mbit oder Uploadrate unter 0,4 Mbit liegt", "systems":[], "show":true},
	"system":{"title":"Displays", "text":"Liste aller Displays", "systems":[], "show":false},
	"done":{"title":"never toSee", "unfinished":true, "show":false}
}; // -> also setCheckList() for filter
var _showErrorMessages = true;
var _countdowntimer = null;
var _systemChecksPromise = [];
$(window).on("unload", function(e) {
    _showErrorMessages = false;
});
$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
	options.crossDomain = {crossDomain: true};
	options.xhrFields = {withCredentials: true};
	if (!originalOptions.hasOwnProperty('headers') || !originalOptions.headers.hasOwnProperty('Accept') || !originalOptions.headers.Accept === "text/csv")
		options.headers = {"session-duration":90}; // default: 15min
});

$(document).ready(function() {
    holdSession();
    getUser().then((user) => {
		const getInitials = (fullName) => {
			const allNames = fullName.trim().split(' ');
			const initials = allNames.reduce((acc, curr, index) => {
			  if(index === 0 || index === allNames.length - 1){
				acc = `${acc}${curr.charAt(0).toUpperCase()}`;
			  }
			  return acc;
			}, '');
			return initials;
		}
		let name = user.hasOwnProperty('fullName') ?user.fullName :user.name;
		$("#username").text(name);
		$(".seru_avatar").text(getInitials(name));
	});
    $('.logout').click(function() {
        localStorage.removeItem("servicetool.user");
		localStorage.removeItem("servicetool.openedmenulist");
        localStorage.removeItem("servicetool.session.expired");
		localStorage.removeItem("servicetool.systemchecks");
		localStorage.removeItem("servicetool.applicationversion");
        deleteSession();
    });	
});  

function holdSession() {
	$.ajax({
		timeout: 15000,
		url: "https://his.homeinfo.de/session/!",
		type: "PUT",
		cache: false,
		success: function (msg) {
			if ((new Date(msg.end) - new Date()) < 0) {
				localStorage.setItem("servicetool.session.expired", true);
				window.location.href = "index.html";
			} else {
				localStorage.removeItem("servicetool.session.expired");
				localStorage.setItem("servicetool.url", window.location.href);
				countdown(msg.end);
			}
		},
		error: function (msg) { // EXPIRED
			if (/*msg.statusText !== "error" || */msg.status !== 0) {
				localStorage.setItem("servicetool.session.expired", true);
				if (msg.statusText == "Gone" || msg.statusText == "Not Found" || msg.statusText == "No Reason Phrase" || msg.statusText == "Unauthorized" || msg.responseText == '{"message": "Keine Sitzung angegeben."}' || msg.responseText == '{"message": "No session specified."}' || msg.responseText == '{"message": "Session expired."}') {
					window.location.href = "index.html";
				}
			}
		}
	});
}
function countdown(end) {
	clearInterval(_countdowntimer);
	_countdowntimer = setInterval(function() {
		let countDownDate = new Date(end).getTime()-10000;
		let now = new Date().getTime();
		let distance = countDownDate - now;
		if (distance <= 0) {
			clearInterval(_countdowntimer);
			localStorage.setItem("servicetool.session.expired", true);
			deleteSession();
		}
	} , 1000);
}
function deleteSession() {
	$.ajax({
		url: "https://his.homeinfo.de/session/!",
		type: "DELETE",
		complete: function (msg) {
			window.location.href = "index.html";
		}
	});
}

function getUser() {
	if (localStorage.getItem("servicetool.user") !== null) {
		return Promise.resolve(JSON.parse(localStorage.getItem("servicetool.user")));
	} else {
		return $.ajax({
			timeout: 15000,
			url: "https://his.homeinfo.de/account/!",
			type: "GET",
			success: function (user) {
				localStorage.setItem("servicetool.user", JSON.stringify(user));
			},
			error: function (msg) {
			}
		});
	}
}

function getListOfSystemChecks() {
	if (_systemChecksPromise.length === 0) {
		_systemChecksPromise.push(getCheckPromis());
		_systemChecksPromise.push(getApplicationVersion());
	}
	return _systemChecksPromise;
}
function getCheckPromis() {
	if (localStorage.getItem("servicetool.systemchecks") !== null) {
		let list = JSON.parse(localStorage.getItem("servicetool.systemchecks"));
		return Promise.resolve(list);
	} else {
		return $.ajax({
			url: "https://sysmon.homeinfo.de/checks",
			type: "GET",
			cache: false,
			success: function (list) {
				localStorage.setItem("servicetool.systemchecks", JSON.stringify(list));
			},
			error: function (msg) {
				setErrorMessage(msg, "Laden der Systemliste");
			}
		});
	}
}
function setCheckList(list, applicationVersion) {
    list = $.map(list, function(value, index){
        return [value];
    });

    if (_commonChecks.done.unfinished) {
		for (let check of list) {
			if (!check.hasOwnProperty("deployment")) {
				if (check.fitted)
					_commonChecks.noDeployment.systems.push(check);
				check.deployment = {"customer":{"id":-1, "abbreviation": "Zuordnung nicht vorhanden"}};
				if (!check.deployment.hasOwnProperty("customer"))
					check.deployment.customer = {"id":-1, "abbreviation": "Zuordnung nicht vorhanden"}
				if (!check.deployment.hasOwnProperty("address"))
					check.deployment.address = {"street":"Keine Adresse", "houseNumber":"", "zipCode":"", "city":""}
			} else {
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("offlineSince") && check.fitted && !check.deployment.testing) {
					_commonChecks.offline.systems.push(check);
					if (!isOnDate(check.checkResults[0].offlineSince, THREE_MONTHS))
						_commonChecks.offlineThreeMonth.systems.push(check);
				}
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].smartCheck === "failed")
					_commonChecks.ssd.systems.push(check);
				if (check.hasOwnProperty("lastSync") && !isOnDate(check.lastSync, 24) && check.fitted && !check.deployment.testing && (!check.hasOwnProperty("checkResults") || (check.checkResults.length > 0 && !check.checkResults[0].hasOwnProperty("offlineSince"))))
					_commonChecks.noActualData.systems.push(check);
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && (check.checkResults[0].applicationState === "not running" || check.checkResults[0].applicationState === "not enabled") && check.fitted && !check.deployment.testing)
					_commonChecks.appRunning.systems.push(check);
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].applicationState !== "html" && check.checkResults[0].applicationState !== "air" && check.checkResults[0].applicationState !== "unknown" && check.fitted && !check.deployment.testing)
					_commonChecks.blackscreen.systems.push(check);
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("ramAvailable") && check.checkResults[0].hasOwnProperty("ramTotal") && parseInt(check.checkResults[0].ramAvailable)*4 < parseInt(check.checkResults[0].ramTotal))
					_commonChecks.ramfree.systems.push(check);
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("ramTotal") && parseInt(check.checkResults[0].ramTotal/1024) < 2000)
					_commonChecks.ram.systems.push(check);
				if (!check.fitted && !check.deployment.testing)
					_commonChecks.notfitted.systems.push(check);
				if (check.deployment.testing)
					_commonChecks.testsystem.systems.push(check);
				//if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("applicationVersion") && check.checkResults[0].applicationVersion !== applicationVersion && check.fitted && !check.deployment.testing)
				//	_commonChecks.oldApplication.systems.push(check);
				if (!check.hasOwnProperty("checkResults") || (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && !isOnDate(check.checkResults[0].timestamp, 48)))
					_commonChecks.systemchecksFailed.systems.push(check);
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].applicationState === "air")
					_commonChecks.air.systems.push(check);
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].sensors === "failed")
					_commonChecks.sensors.systems.push(check);
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].rootNotRo === "failed")
					_commonChecks.root.systems.push(check);
				if (!check.hasOwnProperty("pubkey"))
					_commonChecks.wireguard.systems.push(check);
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && (check.checkResults[0].hasOwnProperty("download") && check.checkResults[0].download*_KIBIBITTOMBIT < 2) || (check.checkResults[0].hasOwnProperty("upload") && check.checkResults[0].upload*_KIBIBITTOMBIT < 0.4))
					_commonChecks.downloadUpload.systems.push(check);
				_commonChecks.system.systems.push(check);
			}
		}
	}
	_commonChecks.done.unfinished = false;
	return list;
}

function getApplicationVersion() {
	if (localStorage.getItem("servicetool.applicationversion") !== null) {
		return Promise.resolve(JSON.parse(localStorage.getItem("servicetool.applicationversion")));
	} else {
		return $.ajax({
			url: "https://sysmon.homeinfo.de/current-application-version/html",
			type: "GET",
			cache: false,
			success: function (data) {
				localStorage.setItem("servicetool.applicationversion", JSON.stringify(data));
			},
			error: function (msg) {
				setErrorMessage(msg, "Abrufen der Applicationsversion");
			}
		});
	}
}

function getCustomerView() {
    return $.ajax({
        url: "https://sysmon.homeinfo.de/enduser",  // ?customer=1030020
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Laden der Kundenansicht ");
        }
    });
}
// Not used
function getScreenShot(systemID) {
    return $.ajax({
        url: "https://sysmon.homeinfo.de/screenshot" + systemID,
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Laden des Screenshots");
        }
    });
}
function getDeployments() {
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
function setErrorMessage(msg, fromFunction) {
	try {
		if (msg.responseText.indexOf("Sysinfo unsupported on this system.") !== -1)
			throw true;
		let message = "Leider ist ein Fehler aufgetreten";
		if (msg.responseText.indexOf("System is offline.") !== -1)
			message = "Das System ist offline."
		else if (msg.responseText.indexOf("No such system.") !== -1)
			message = "Das System existiert nicht."
		Swal.fire({
			title: 'Das hat nicht geklappt.',
			text: message,
			showCancelButton: false,
			confirmButtonColor: '#ff821d',
			iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
			confirmButtonText: 'O.K.',
			buttonsStyling: true
		});
	} catch(error) {	}
	try {
		console.log(msg);
		if (_showErrorMessages) {
			if (msg.statusText === "Forbidden" || (msg.hasOwnProperty('responseJSON') && msg.responseJSON.message === "Zugriff verweigert.")) {
				if (fromFunction !== "die Services anzuzeigen")
					$("#message").html('<font class="errormsg">Sie haben leider keine Berechtigung zum <b>' + fromFunction + '</b>.</font>');
			} else if (msg.hasOwnProperty('responseJSON') && msg.responseJSON.message === "Inhalt existiert bereits.") {
				$("#message").html('<font class="errormsg">Sie haben nicht die Möglichkeit zum <b>' + fromFunction + '</b>.</font>');
			} else if (msg.hasOwnProperty('responseJSON') && msg.responseJSON.message === "Kein solcher Inhalt.") {
				$("#message").html('<font class="errormsg">Dieser Inhalt wurde bereits gelöscht.</font>');
			} else if (msg.hasOwnProperty('responseJSON') && msg.responseJSON.message === "Not authorized.") {
				$("#message").html('<font class="errormsg">Sie haben leider <b>keine Berechtigung</b> diese Seite anzuzeigen.</font>');
			} else if (msg.statusText !== "error" || msg.status !== 0) {
				$("#message").html('<font class="errormsg">Leider ist ein Fehler beim <b>"' + fromFunction + '"</b> aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.</font>');
			}
		}
	} catch(error) {
		console.log('Fehler in: "' + fromFunction + "':");
		console.log(msg);
		$("#message").html('<font class="errormsg">Leider ist ein Fehler beim <b>"' + fromFunction + '"</b> aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.</font>');
	}
	$('#pageloader').hide();
}
function compare(a, b) {
	return (a < b) ?-1 : (a > b) ?1 :0;
}
function compareInverted(a, b) {
	return (a > b) ?-1 : (a < b) ?1 :0;
}
function isOnDate(dateToCheck, periodInHours) {
    periodInHours = periodInHours * ONE_HOUR;
    return (new Date()) - new Date(dateToCheck) < periodInHours;
}
function formatDate(date) {
	return date.substring(8, 10) + "." + date.substring(5, 7) + "." + date.substring(2, 4); // dd-mm-yy
}
function getURLParameterByName(name) {
    let match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}