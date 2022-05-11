$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
	options.crossDomain = {crossDomain: true};
	options.xhrFields = {withCredentials: true};
});
checkSession();
$(document).ready(function() {
	if (isIE() && !isIEorEDGE()) {
		$("#username").hide();
		$("#password").hide();
		$("#login").hide();
		document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Leider wird ihr Browser nicht unterstützt.';
		$("#warning").show();
    } else
		$("#warning").hide();
    $("#login").click(function(){
		$('#warning').removeClass('alert-success').addClass('alert-danger');
		document.getElementById("warning").innerHTML = '';
		login();
    });
	$("#forgot_password").click(function(e) {
		$('#warning').removeClass('alert-success').addClass('alert-danger');
		if ($("#username").val() != '') {
			if ($('#recap').is(':visible'))
				$('#recap').hide(300);
			else
				$('#recap').show(300);
		} else {
			document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Bitte geben Sie zuerst Ihren Benutzernamen ein.';
		$("#warning").show();
		}
			
		e.preventDefault()
    });
	if (localStorage.getItem("servicetool.session.expired")) {
		removeLocalStorage();
		document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Ihre Sitzung ist abgelaufen. Bitte melden Sie sich neu an.';
		$("#warning").show();
	}
	$("#username").focus();
	$("#container_style").show();
});
$(document).keypress(function(e) {
    if(e.which == 13) { // 'enter'
        login();
    }
});

function login() {
	$('#pageloader').show();
	$.ajax({
		timeout: 15000,
		url: "https://his.homeinfo.de/session", // duration=15 by default
		type: "POST",
		data: JSON.stringify({'account':$("#username").val(), "passwd":$("#password").val()}),
		contentType: 'application/json',
		success: function (msg) {
			if (typeof(Storage) !== "undefined") {
				if (localStorage.getItem("servicetool.url") !== null) {
					window.location.href = localStorage.getItem("servicetool.url");
				} else {
					window.location.href = "dashboard.html";
				}
			} else {
				document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Leider ist etwas schiefgelaufen. Ihr Browser unterstützt keine Cookies.';
				$("#warning").show();
			}
		},
		error: function (msg) {
			console.log(msg);
			try {
				if (msg.responseJSON.message == "Invalid user name and / or password.")
					document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> LogIn Daten sind falsch.';
				else if (msg.responseJSON.message == "Account locked.")
					document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Aus Sicherheitsgründen wurde Ihr Konto gesperrt. Setzen Sie Ihr Password zurück, oder kontaktieren Sie uns bitte.';
				else
					document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Leider war der LogIn nicht erfolgreich. Bitte versuchen Sie es später noch einmal.';				
			} catch(e) {
				document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Leider war der LogIn nicht erfolgreich. Bitte versuchen Sie es später noch einmal.';
			}
			$('#pageloader').hide();
			$("#warning").show();
		}
	});
}

function checkSession() {
	localStorage.removeItem("servicetool.user");
	$('#pageloader').show();
	$.ajax({
		timeout: 15000,
		url: "https://his.homeinfo.de/session/!",
		type: "GET",
		success: function (msg) {
			if (localStorage.getItem("servicetool.url") !== null)
				window.location.href = localStorage.getItem("servicetool.url");
			else
				window.location.href = "dashboard.html";
		},
		error: function (xmlhttprequest, textstatus, message) { // EXPIRED
			$('#pageloader').hide();
			removeLocalStorage();
			if(textstatus === "timeout")
				document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Service ist leider nicht aktiv. Bitte versuchen Sie es später noch einmal.';
		}
	});
}

function sendEmail(response) {
	$('#warning').removeClass('alert-success').addClass('alert-danger');
	if (response == null) {
		document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Bitte geben Sie Ihren Benutzernamen ein.';
		$("#warning").show();
	} else {
		$.ajax({
			url: 'https://his.homeinfo.de/pwreset/request',
			type: 'POST',
			data: JSON.stringify({'account':$("#username").val(), "response":response, "sitekey":"6Lf71m8UAAAAAFeSAFKaNOqNQGTWTGEOMTs5gs_I"}),
			contentType: 'application/json',
			cache: false,
			success: function (msg) {
				$('#warning').removeClass('alert-danger').addClass('alert-success');
				document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Prüfen Sie Ihr Postfach.';
				$("#warning").show();
			},
			error: function (msg) {
				console.log(msg);
				$('#warning').removeClass('alert-success').addClass('alert-danger');
				if (msg.hasOwnProperty('responseJSON')) {
					if (msg.responseJSON.message == "No account specified.")
						document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Es wurde kein Benutzername eingegeben.';
					else if (msg.responseJSON.message == "A password reset is already pending.")
						document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Eine E-Mail wurde bereits versandt. Aus Sicherheitsgründen können Sie diesen Service erst nach einer Stunde wieder benutzen oder kontaktieren Sie uns.';
					else
						document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Leider hat das nicht geklappt. Kontaktieren Sie uns bitte.';
				} else
					document.getElementById("warning").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Leider hat das nicht geklappt. Kontaktieren Sie uns bitte.';
				$("#warning").show();
			}
		});
	}
}
function isIE() {
//console.log(navigator.userAgentData)
	return navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1 || navigator.userAgent.indexOf("Edge/") > -1;
}
function isIEorEDGE(){
	return navigator.appName == 'Microsoft Internet Explorer' || (navigator.appName == "Netscape" && navigator.appVersion.indexOf('Edge') > -1);
}
function removeLocalStorage() {
	localStorage.removeItem("servicetool.user");
	localStorage.removeItem("servicetool.session.expired");
	localStorage.removeItem("servicetool.systemchecks");
	/*
	localStorage.removeItem("customers");
	localStorage.removeItem("customer");
	localStorage.removeItem("customerid");
	localStorage.removeItem("comcataccounts");
	localStorage.removeItem("listofmenuitemsforcomcatchart");
	localStorage.removeItem("clients");
	localStorage.removeItem("clientsassoc");
	localStorage.removeItem("groups");
	//localStorage.removeItem("members");
	localStorage.removeItem("charts");
	localStorage.removeItem("menu");
	localStorage.removeItem("configuration");
	localStorage.removeItem("expandedgroupids");
	localStorage.removeItem("services");
	//localStorage.clear();
	*/
}
