$(document).ready(function() {
	let menu = '<div class="loader" id="pageloader"></div><div class="menu_content">' +
        '<div class="side_logo">' +
            '<a href="dashboard.html"><img src="assets/img/sideLogo.png" alt="Logo"></a>' +
        '</div>' +
        '<div class="side_menu">' +
            '<h3 class="menu_title">Menu</h3>' +
            '<ul class="navbar-nav">' +
                '<li class="nav-item">' +
                    '<a class="nav-link active" aria-current="page" href="dashboard.html">Dashboard</a>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Kundenliste' +
                    '</a>' +
                    '<ul class="dropdown-menu" id="menucustomerlist" aria-labelledby="navbarDropdown">' +
                        '<li><a class="dropdown-item" href="#">Kunden werden geladen...</a></li>' +
                    '</ul>' +
                '</li>' +
                '<li class="nav-item">' +
                    '<a class="nav-link" href="#">Standorte zuweisen</a>' +
                '</li>' +
                '<li class="nav-item">' +
                    '<a class="nav-link" href="#">Neuinstallationen</a>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle menuSSDCounter" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'SSD Karten Fehler' +
                    '</a>' +
                    '<ul class="dropdown-menu" id="menuSSD" aria-labelledby="navbarDropdown">' +
                    '</ul>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle menuNotfittedCounter" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Nicht verbaute Systeme' +
                    '</a>' +
                    '<ul class="dropdown-menu" id="menuNotfitted" aria-labelledby="navbarDropdown">' +
                    '</ul>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle menuTestsystemsCounter" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Testgerät' +
                    '</a>' +
                    '<ul class="dropdown-menu" id="menuTestsystems" aria-labelledby="navbarDropdown">' +
                        '</ul>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle menuActualDataCounter" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Keine aktuellen Daten' +
                    '</a>' +
                    '<ul class="dropdown-menu" id="menuActualData" aria-labelledby="navbarDropdown">' +
                        '</ul>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle menuBlackscreenCounter" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Im Schwarz-Bildmodus' +
                    '</a>' +
                    '<ul class="dropdown-menu" id="menuBlackscreen" aria-labelledby="navbarDropdown">' +
                    '</ul>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle menuOldApplicationCounter" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Alte Application Version(en)' +
                    '</a>' +
                    '<ul class="dropdown-menu" id="menuOldApplication" aria-labelledby="navbarDropdown">' +
                    '</ul>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle menuOfflineCounter" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Offline mehr als 3 Monate' +
                    '</a>' +
                    '<ul class="dropdown-menu" id="menuOffline" aria-labelledby="navbarDropdown">' +
                    '</ul>' +
                '</li>' +
            '</ul>' +
            '<a href="#" class="abmelden">abmelden</a>' +
        '</div>' +
        '<div class="admin_box">' +
            '<div class="admin_content">' +
                '<img src="assets/img/rocket.svg" alt="Admin">' +
                '<h5>Supportanfrage</h5>' +
                '<p class="fz12">Serviceanfrage zu dieser <br>Seite an den Admin</p>' +
                '<a href="#" class="whiteBtn sendBtn">SENDEN</a>' +
            '</div>' +
            '<p class="fz8">Ein Dienst der HOMEINFO GmbH (c) 2022</p>' +
        '</div>' +
    '</div>';
    $(".menu_sidebar").html(menu);
    getListOfSystemChecks().then(setMenu);
});

function setMenu(checks) {
    let list = $.map(checks, function(value, index){
        return [value];
    });
    let customers = {};
    let ssdcarderrors = 0;
    let notfitted = 0;
    let testsystems = 0;
    let noActualData = 0;
    let blackscreens = 0;
    let oldApplication = 0;
    let offline = 0;
    let customerDom = "";
    let ssdDom = "";
    let notFittedDom = "";
    let testsystemsDom = "";
    let actualDataDom = "";
    let blackScreenDom = "";
    let oldApplicationDom = "";
    let offlineDom = "";

    for (let check of list) {
        // Customerlist
        if (check.hasOwnProperty("deployment") && !customers.hasOwnProperty(check.deployment.customer.company.abbreviation)) {
            customerDom += '<li><a class="dropdown-item" href="#">' + (check.deployment.customer.company.hasOwnProperty("abbreviation") ?check.deployment.customer.company.abbreviation :check.deployment.customer.company.name) + '</a></li>';
            customers[check.deployment.customer.company.abbreviation] = {};
        }

        // Errorsystems list
        if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].smartCheck === "failed") {
            ssdcarderrors++;
            ssdDom += '<li><a class="dropdown-item" href="#">SSD Karten Fehler (0)</a></li>';
        }
        if (!check.fitted) {
            notfitted++;
            notFittedDom += '<li><a class="dropdown-item" href="#">Nicht verbaute Systeme (08)</a></li>';
        }
        if (check.hasOwnProperty("deployment") && check.deployment.testing) {
            testsystems++;
            testsystemsDom += '<li><a class="dropdown-item" href="#">Testgeräte (2)</a></li>';
        }   

        if (!isOnDate(check.lastSync, THREE_MONTHS)) {
            noActualData++;
            actualDataDom += '<li><a class="dropdown-item" href="#">Testgeräte (2)</a></li>';
        }
        if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].applicationState === "not running") {
            blackscreens++;
            blackScreenDom +='<li><a class="dropdown-item" href="#">Im Schwartzbildmodus (0)</a></li>';
        }
        //TODO
        oldApplicationDom += '<li><a class="dropdown-item" href="#">Alte OS Version (31)</a></li>';
        if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("offlineSince") && !isOnDate(check.checkResults[0].offlineSince, THREE_MONTHS)) {
            offline++;
            offlineDom += '<li><a class="dropdown-item" href="#">Offline mehr als 3 Monate (0)</a></li>';
        }
    }
    $('#menucustomerlist').html(customerDom);
    $('.menuSSDCounter').text('SSD Karten Fehler (' + ssdcarderrors + ')');
    $('#menuSSD').html(ssdDom);
    $('.menuNotfittedCounter').text('Nicht verbaute Systeme (' + notfitted + ')');
    $('#menuNotfitted').html(notFittedDom);
    $('.menuTestsystemsCounter').text('Testgerät (' + testsystems + ')');
    $('#menuTestsystems').html(testsystemsDom);
    $('.menuActualDataCounter').text('Daten älter als 3 Monate (' + noActualData + ')');
    $('#menuActualData').html(actualDataDom);
    $('.menuBlackscreenCounter').text('Im Schwarz-Bildmodus (' + blackscreens + ')');
    $('#menuBlackscreen').html(blackScreenDom);
    $('.menuOldApplicationCounter').text('Alte Application TODO(' + oldApplication + ')');
    $('#menuOldApplication').html(oldApplicationDom);
    $('.menuOfflineCounter').text('Offline mehr als 3 Monate (' + offline + ')');
    $('#menuOffline').html(offlineDom);
    
}