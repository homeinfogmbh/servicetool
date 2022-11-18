const ONE_HOUR = 60 * 60 * 1000; // Milliseconds;
const THREE_MONTHS = 3 * 30 * 24; // Hours
const _KIBIBITTOMBIT = 1024/1000/1000;//test
var _coffin = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M8,22L5,8L8,2H16L19,8L16,22H8M11,6V8H9V10H11V15H13V10H15V8H13V6H11Z" /></svg>';
var _commonChecks = {"offline":{"title":"Offline", "text":"Liste der Geräte die offline sind", "systems":[], "show":true},
	"offlineThreeMonth":{"title":"Lange offline", "text":"Liste der Geräte die länger als 3 Monate offline sind", "systems":[], "show":true},
	"noDeployment":{"title":"Systeme ohne Zuordnung", "text":"Liste der Geräte die keine Zuordnung besitzen", "systems":[], "show":true},
	"ssd":{"title":"SSD Karten Fehler", "text":"Liste der Geräte die einen SSD-Karten-Fehler aufweisen", "systems":[], "show":true},
	"noActualData":{"title":"Keine aktuellen Daten", "text":"Liste der Geräte die keine aktuellen Daten besitzen", "systems":[], "show":true},
	"blackscreen":{"title":"Im Schwarzbild-Modus", "text":"Liste der Geräte die schwarz geschaltet sind bzw. die App nicht läuft", "systems":[], "show":true},
	"ramfree":{"title":"Geringer verfügbarer Speicher", "text":"Liste der Geräte die weniger als 1/4 des Speichers freihaben", "systems":[], "show":true},
	"ram":{"title":"Zu wenig RAM verbaut", "text":"Liste der Geräte die wenige als 2 GB RAM aufweisen", "systems":[], "show":true},
 	"notfitted":{"title":"Nicht verbaute Displays", "text":"Liste der Geräte die nicht verbaut sind", "systems":[], "show":true},
	"testsystem":{"title":"Testgeräte", "text":"Liste der Testgeräte", "systems":[], "show":true},
	//"oldApplication":{"title":"Alte Applicationen", "text":"Liste der Geräte auf denen eine alte Version der Applikation läuft", "systems":[], "show":true},
	"systemchecksFailed":{"title":"Systemchecks fehlgeschlagen", "text":"Liste der Geräte die länger als 48h nicht überprüft werden konnten", "systems":[], "show":true},
	"air":{"title":"AIR Systeme", "text":"Liste der Geräte die noch die AIR-Application laufen haben", "systems":[], "show":true},
	"sensors":{"title":"Überhitzt", "text":"Liste der Geräte mit Sensoren, die ihre Grenzwerte überschritten haben.", "systems":[], "show":true},
	"root":{"title":"Kein Schreibzugriff", "text":'Liste der Geräte mit Root-Partitionen, die im "nur-lesen-Modus" gemountet sind.', "systems":[], "show":true},
	"wireguard":{"title":"Kein Wireguard", "text":"Liste aller Systeme ohne Wireguard", "systems":[], "show":true},
	"downloadUpload":{"title":"Download/Upload kritisch", "text":"Liste aller Systeme, deren Downloadrate unter 2,0 Mbit oder Uploadrate unter 0,4 Mbit liegt", "systems":[], "show":true},
	"updating":{"title":"Patching", "text":"Liste aller Systeme die gepatched werden", "systems":[], "show":true},
	"blacklist":{"title":"Blacklist", "text":"Liste aller Systeme auf der Blacklist", "systems":[], "show":true},
	"lessTouches":{"title":"21 Tage ohne Touch", "text":"Displays (Standorte) auf denen 21 Tage keine Klicks registriert wurden", "systems":[], "show":true},
	"toMuchTouches":{"title":"Touch Überflutung", "text":"Displays (Standorte) auf denen in den letzten 3 Tagen mehr  als 500 Klicks registriert wurden", "systems":[], "show":true},
	"fsckRepair":{"title":"Autom. Dateisystemreparatur deaktiviert", "text":"Alle Systeme, deren Dateisystemreparatur nicht aktiviert ist.", "systems":[], "show":true},
	"system":{"title":"Displays", "text":"Liste aller Displays", "systems":[], "show":false},
	"systemReducedByBlacklist":{"title":"Displays", "text":"Liste aller Displays ohne Blacklist", "systems":[], "show":false},
	"checkedToday":{"title":"Displays", "text":"Liste aller Displays ohne Blacklist", "systems":[], "show":false},
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
		localStorage.removeItem("servicetool.blacklist");
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
		_systemChecksPromise.push(getBlacklist());
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

function setCheckList(list, applicationVersion, blacklist) {
    list = $.map(list, function(value, index){
        return [value];
    });
	let check;
	let blacklistitem;
	let found;
	let listReducedByBlacklist = [];
	// Substract blacklist from checklist
	for (check of list) {
		found = false;
		for (blacklistitem of blacklist) {
			if (check.id === blacklistitem.id) {
				check.blacklist = true;
				found = true;
				break;
			}
		}
		if (check.hasOwnProperty("deployment") && _commonChecks.done.unfinished) {
			_commonChecks.system.systems.push(check);
			if (check.updating)
				_commonChecks.updating.systems.push(check);
		}
		if (!found)
			listReducedByBlacklist.push(check);
		else if (check.hasOwnProperty("deployment") && _commonChecks.done.unfinished)
			_commonChecks.blacklist.systems.push(check);
		if (!check.hasOwnProperty("deployment") && _commonChecks.done.unfinished) {
			check.deployment = {"customer":{"id":-1, "abbreviation": "Zuordnung nicht vorhanden"}};
			if (!check.deployment.hasOwnProperty("customer"))
				check.deployment.customer = {"id":-1, "abbreviation": "Zuordnung nicht vorhanden"}
			if (!check.deployment.hasOwnProperty("address"))
				check.deployment.address = {"street":"Keine Adresse", "houseNumber":"", "zipCode":"", "city":""}
			_commonChecks.noDeployment.systems.push(check);
			if (check.updating)
				_commonChecks.updating.systems.push(check);	
		}
	}

    if (_commonChecks.done.unfinished) {
		for (check of listReducedByBlacklist) {
			if (!check.hasOwnProperty("deployment")) {
				check.deployment = {"customer":{"id":-1, "abbreviation": "Zuordnung nicht vorhanden"}};
				if (!check.deployment.hasOwnProperty("customer"))
					check.deployment.customer = {"id":-1, "abbreviation": "Zuordnung nicht vorhanden"}
				if (!check.deployment.hasOwnProperty("address"))
					check.deployment.address = {"street":"Keine Adresse", "houseNumber":"", "zipCode":"", "city":""}
			} else {
				//if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("offlineSince") && check.checkResults[0].sshLogin !== "success" && !check.checkResults[0].icmpRequest && check.fitted && !check.deployment.testing && check.operatingSystem.toLowerCase().indexOf("windows") === -1) {
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && !check.checkResults[0].online && check.fitted && !check.deployment.testing) {
					_commonChecks.offline.systems.push(check);
					if (!isOnDate(check.checkResults[0].offlineSince, THREE_MONTHS))
						_commonChecks.offlineThreeMonth.systems.push(check);
				}
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].smartCheck === "failed")
					_commonChecks.ssd.systems.push(check);
				//if (check.hasOwnProperty("lastSync") && !isOnDate(check.lastSync, 24) && check.fitted && !check.deployment.testing && (!check.hasOwnProperty("checkResults") || (check.checkResults.length > 0 && !check.checkResults[0].hasOwnProperty("offlineSince"))))
				if (check.hasOwnProperty("lastSync") && !isOnDate(check.lastSync, 24) && check.fitted && !check.deployment.testing && (!check.hasOwnProperty("checkResults") || (check.checkResults.length > 0 && check.checkResults[0].sshLogin !== "failed" && check.checkResults[0].icmpRequest)))
					_commonChecks.noActualData.systems.push(check);
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
				//console.log(check.checkResults[0].applicationVersion)
				//if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("applicationVersion") && (check.checkResults[0].applicationVersion === "2.88.0-1" || check.checkResults[0].applicationVersion === "2.90.0-1") && check.fitted && !check.deployment.testing)
					//console.log(check.deployment.customer.id + " // " + check.id);
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
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("recentTouchEvents") && check.checkResults[0].recentTouchEvents === 0)
					_commonChecks.lessTouches.systems.push(check);
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("recentTouchEvents") && check.checkResults[0].recentTouchEvents > 500)
					_commonChecks.toMuchTouches.systems.push(check);
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && (!check.checkResults[0].hasOwnProperty("fsckRepair") || (check.checkResults[0].hasOwnProperty("fsckRepair") && check.checkResults[0].fsckRepair !== "yes")))
					_commonChecks.fsckRepair.systems.push(check);
				if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0) {
					_commonChecks.systemReducedByBlacklist.systems.push(check);
					if (new Date(check.checkResults[0].timestamp).setHours(0,0,0,0) == new Date().setHours(0,0,0,0))
						_commonChecks.checkedToday.systems.push(check);	
				}
			}
		}
	}
	_commonChecks.done.unfinished = false;
	return listReducedByBlacklist;
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

function getBlacklist() {
	if (localStorage.getItem("servicetool.blacklist") !== null) {
		return Promise.resolve(JSON.parse(localStorage.getItem("servicetool.blacklist")));
	} else {
		return $.ajax({
			url: "https://sysmon.homeinfo.de/blacklist",
			type: "GET",
			cache: false,
			success: function (data) {
				localStorage.setItem("servicetool.blacklist", JSON.stringify(data));
			},
			error: function (msg) {
				setErrorMessage(msg, "Abrufen der Blackliste");
			}
		});
	}
}

function getCheckByDays(days) { // 1:DDB; 2:Exposé-TV
    return $.ajax({
        url: "https://sysmon.homeinfo.de/offline-history/" + days, //"https://sysmon.homeinfo.de/checks?days-ago=" + days,
        type: "GET",
        cache: false,
        error: function (msg) {
            setErrorMessage(msg, "Laden der Systemliste für Tag" + days + (days > 1 ?"e" :""));
        }
    });
}

function getCustomerView() {
    return $.ajax({
        url: "https://sysmon.homeinfo.de/enduser",  // ?customer=1030020
        type: "GET",
        cache: false,
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
        error: function (msg) {
            setErrorMessage(msg, "Listen der Standorte");
        }
    });
}
function getSystems() {
    return $.ajax({
        url: "https://termgr.homeinfo.de/list/systems",
        type: "GET",
        cache: false,
        error: function (msg) {
            setErrorMessage(msg, "Listen der Systeme");
        }
    });
}
function setErrorMessage(msg, fromFunction) {
	try {
		let title = "Das hat nicht geklappt";
		let message = "Leider ist ein Fehler beim " + fromFunction + " aufgetreten: ";
		if (msg.responseText.indexOf("Sysinfo unsupported on this system.") !== -1) {
			title = "Systeminfos können nicht geladen werden";
			message = "Das System wird nicht unterstützt."
		}
		if (msg.responseText.indexOf("System is offline.") !== -1)
			message = "Das System ist offline."
		else if (msg.responseText.indexOf("No such system.") !== -1)
			message = "Das System existiert nicht."
		Swal.fire({
			title: title,
			text: message,
			showCancelButton: false,
			confirmButtonColor: '#ff821d',
			iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
			confirmButtonText: 'O.K.',
			buttonsStyling: true
		});
	} catch(error) {	}
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