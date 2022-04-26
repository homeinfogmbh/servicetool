$(document).ready(function() {
    getListOfSystemChecks().then(setVariableMenu); 
	let menu = '<div class="loader" id="pageloader"></div><div class="menu_content">' +
        '<div class="side_logo">' +
            '<a href="index.html"><img src="assets/img/sideLogo.png" alt="Logo"></a>' +
        '</div>' +
        '<div class="side_menu">' +
            '<h3 class="menu_title">Menu</h3>' +
            '<ul class="navbar-nav">' +
                '<li class="nav-item">' +
                    '<a class="nav-link active" aria-current="page" href="index.html">Dashboard</a>' +
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
                    '<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'SSD Karten Fehler (0)' +
                    '</a>' +
                    '<ul class="dropdown-menu" aria-labelledby="navbarDropdown">' +
                        '<li><a class="dropdown-item" href="#">SSD Karten Fehler (0)</a></li>' +
                        '<li><a class="dropdown-item" href="#">SSD Karten Fehler (0)</a></li>' +
                        '<li><a class="dropdown-item" href="#">SSD Karten Fehler (0)</a></li>' +
                        '<li><a class="dropdown-item" href="#">SSD Karten Fehler (0)</a></li>' +
                    '</ul>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Nicht verbaute Systeme (08)' +
                    '</a>' +
                    '<ul class="dropdown-menu" aria-labelledby="navbarDropdown">' +
                        '<li><a class="dropdown-item" href="#">Nicht verbaute Systeme (08)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Nicht verbaute Systeme (08)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Nicht verbaute Systeme (08)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Nicht verbaute Systeme (08)</a></li>' +
                    '</ul>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Testgeräte (2)' +
                    '</a>' +
                    '<ul class="dropdown-menu" aria-labelledby="navbarDropdown">' +
                        '<li><a class="dropdown-item" href="#">Testgeräte (2)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Testgeräte (2)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Testgeräte (2)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Testgeräte (2)</a></li>' +
                        '</ul>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Im Schwartzbildmodus (0)' +
                    '</a>' +
                    '<ul class="dropdown-menu" aria-labelledby="navbarDropdown">' +
                        '<li><a class="dropdown-item" href="#">Im Schwartzbildmodus (0)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Im Schwartzbildmodus (0)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Im Schwartzbildmodus (0)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Im Schwartzbildmodus (0)</a></li>' +
                    '</ul>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Alte OS Version (31)' +
                    '</a>' +
                    '<ul class="dropdown-menu" aria-labelledby="navbarDropdown">' +
                        '<li><a class="dropdown-item" href="#">Alte OS Version (31)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Alte OS Version (31)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Alte OS Version (31)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Alte OS Version (31)</a></li>' +
                    '</ul>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Offline mehr als 3 Monate (0)' +
                    '</a>' +
                    '<ul class="dropdown-menu" aria-labelledby="navbarDropdown">' +
                        '<li><a class="dropdown-item" href="#">Offline mehr als 3 Monate (0)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Offline mehr als 3 Monate (0)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Offline mehr als 3 Monate (0)</a></li>' +
                        '<li><a class="dropdown-item" href="#">Offline mehr als 3 Monate (0)</a></li>' +
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
});

function setVariableMenu(checks) {
    let customers = {};
    let customersDom = '';
    for (let check in checks) {
        if (checks[check].hasOwnProperty("deployment") && !customers.hasOwnProperty(checks[check].deployment.customer.company.name)) {
            customersDom += '<li><a class="dropdown-item" href="#">' + checks[check].deployment.customer.company.name + '</a></li>';
            customers[checks[check].deployment.customer.company.name] = {};
        }
    }
    $('#menucustomerlist').html(customersDom);
}