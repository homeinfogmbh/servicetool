const ONE_HOUR = 60 * 60 * 1000; // Milliseconds;
const THREE_MONTHS = 3 * 30 * 24; // Hours
var _commonChecks = {"ssdcarderror":{"title":"SSD Karten Fehler", "text":"Liste der Geräte die einen SSD-Karten-Fehler vorweisen", "systems":[], "show":true},
 	"notfitted":{"title":"Nicht verbaute Displays", "text":"Liste der Geräte die nicht verbaut sind", "systems":[], "show":true},
	"testsystem":{"title":"Testgeräte", "text":"Liste der Testgeräte", "systems":[], "show":true},
	"offline":{"title":"Offline", "text":"Liste der Geräte die offline sind", "systems":[], "show":true},
	"offlineThreeMonth":{"title":"Offline mehr als 3 Monate", "systems":[], "show":true},
	"noActualData":{"title":"Keine aktuellen Daten", "text":"Liste der Geräte die keine aktuellen Daten besitzen", "systems":[], "show":true},
	"blackscreen":{"title":"Im Schwarzbild-Modus", "text":"Liste der Geräte die schwarz geschaltet sind", "systems":[], "show":true},
	"oldApplication":{"title":"Alte Applicationen", "text":"Liste der Geräte auf denen eine alte Version der Applikation läuft", "systems":[], "show":true},
	"systemchecksFailed":{"title":"Systemchecks fehlgeschlagen", "text":"Liste der Geräte die nicht gecheckt werden konnten", "systems":[], "show":true},
	"air":{"title":"AIR Systeme", "text":"Liste der Geräte die noch die AIR-Application laufen haben", "systems":[], "show":true},
	"ssd":{"title":"SSD-Karte defekt", "text":"Liste der Geräte deren SSD-Karte Fehler aufweisen", "systems":[], "show":true},
	"system":{"title":"Displays", "text":"Liste aller Displays", "systems":[], "show":false}
}; // -> also setCheckList() for filter
var _showErrorMessages = true;
var _countdowntimer = null;
var _systemChecksPromise = null;
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
	// List all keys:values
	//for (let i = 0, len = localStorage.length; i < len; ++i )
		//console.log(localStorage.key(i) + ": " + localStorage.getItem(localStorage.key(i)));
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
	if (_systemChecksPromise === null)
		_systemChecksPromise = getCheckPromis();
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
function setCheckList(list) {
    list = $.map(list, function(value, index){
        return [value];
    });
    for (let item in _commonChecks)
        _commonChecks[item].systems = [];
	for (let check of list) {
        if (!check.hasOwnProperty("deployment"))
            check.deployment = {"customer":{"id":-1, "abbreviation": "Zuordnung nicht vorhanden"}};
        if (!check.deployment.hasOwnProperty("customer"))
            check.deployment.customer = {"id":-1, "abbreviation": "Zuordnung nicht vorhanden"}
		if (!check.deployment.hasOwnProperty("address"))
			check.deployment.address = {"street":"Keine Adresse", "houseNumber":"", "zipCode":"", "city":""}

		if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].smartCheck === "failed")
			_commonChecks.ssdcarderror.systems.push(check);
		if (!check.fitted)
			_commonChecks.notfitted.systems.push(check);
		if (check.hasOwnProperty("deployment") && check.deployment.testing)
			_commonChecks.testsystem.systems.push(check);
		if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("offlineSince")) {
			_commonChecks.offline.systems.push(check);
			if (!isOnDate(check.checkResults[0].offlineSince, THREE_MONTHS))
				_commonChecks.offlineThreeMonth.systems.push(check);
		}
		if (!isOnDate(check.lastSync, 24))
			_commonChecks.noActualData.systems.push(check);
		if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].applicationState === "not running")
			_commonChecks.blackscreen.systems.push(check);
		if (!check.hasOwnProperty("checkResults") || (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && !isOnDate(check.checkResults[0].timestamp, 24)))
			_commonChecks.systemchecksFailed.systems.push(check);
		if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].applicationState === "air")
			_commonChecks.air.systems.push(check);
		if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].smartCheck === "failed")
			_commonChecks.ssd.systems.push(check);
			
		_commonChecks.system.systems.push(check);
	}
	return list;
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
function setErrorMessage(msg, fromFunction) {
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