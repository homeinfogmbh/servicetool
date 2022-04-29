const ONE_HOUR = 60 * 60 * 1000; // Milliseconds;
const THREE_MONTHS = 3 * 30 * 24; // Hours
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
	_countdowntimer = setInterval(function(){
		var countDownDate = new Date(end).getTime()-10000; // -10000: 10 seconds before end to delete session
		var now = new Date().getTime();
		// Find the distance between now an the count down date
		var distance = countDownDate - now;
		var minutes = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60));
		var seconds = Math.floor((distance % (1000 * 60)) / 1000);
		//$("#sessiontime").html('<font color="#bbb" style="font-size:12px">Sitzung läuft ab <br>in: <b>' + (minutes < 10 ?'0' :'') + minutes + ":" + (seconds < 10 ?'0' :'') + seconds + '</b></font>');
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
	//for (var i = 0, len = localStorage.length; i < len; ++i )
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
		_systemChecksPromise = getPromis();
	return _systemChecksPromise;
}
function getPromis() {
	if (localStorage.getItem("servicetool.systemchecks") !== null) {
		let checks = JSON.parse(localStorage.getItem("servicetool.systemchecks"));
		return Promise.resolve(checks);
	} else {
		return $.ajax({
			url: "https://sysmon.homeinfo.de/checks",
			type: "GET",
			cache: false,
			success: function (data) {
				localStorage.setItem("servicetool.systemchecks", JSON.stringify(data));
			},
			error: function (msg) {
				setErrorMessage(msg, "Laden der Checklist");
			}
		});
	}
}
function checkSystem(systemID) {
    return $.ajax({
        url: "https://sysmon.homeinfo.de/check/" + systemID,
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Checken des Systems");
        }
    });
}
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
function getCustomerView() {
    return $.ajax({
        url: "https://sysmon.homeinfo.de/enduser",
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Laden der Kundenansicht ");
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
	return (a < b) ? -1 : (a > b) ? 1 : 0;
}
function compareInverted(a, b) {
	return (a > b) ? -1 : (a < b) ? 1 : 0;
}
function isOnDate(dateToCheck, periodInHours) {
    periodInHours = periodInHours * ONE_HOUR;
    return (new Date()) - new Date(dateToCheck) < periodInHours;
}
function formatDate(date) {
	return date.substring(8, 10) + "." + date.substring(5, 7) + "." + date.substring(0, 4); // dd-mm-yyyy
}
function getURLParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}