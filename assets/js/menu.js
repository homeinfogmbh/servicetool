$(document).ready(function() {
	let menu = '<div class="loader" id="pageloader"></div><div class="menu_content">' +
        '<div class="side_logo">' +
            '<a href="dashboard.html"><img src="assets/img/sideLogo.png" alt="Logo"></a>' +
        '</div>' +
        '<div class="side_menu">' +
            '<h3 class="menu_title">Menu</h3>' +
            '<ul class="navbar-nav" id="additionalMenu">' +
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

function setMenu(list) {
    list = setCheckList(list);
    let address;
    let addressComplete;
    let customers = {};
    let customerDom = "";

    for (let check of list) {
        addressComplete = check.hasOwnProperty("deployment") && check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber + " " + check.deployment.address.zipCode + " " + check.deployment.address.city :'Keine Adresse';
        address = check.hasOwnProperty("deployment") && check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber :'<i>Keine Adresse</i>';
        // Customerlist
        if (check.hasOwnProperty("deployment") && !customers.hasOwnProperty(check.deployment.customer.abbreviation)) {
            customerDom += '<li><a class="dropdown-item" href="#">' + (check.deployment.customer.hasOwnProperty("abbreviation") ?check.deployment.customer.abbreviation :check.deployment.customer.company.name) + '</a></li>';
            customers[check.deployment.customer.abbreviation] = {};
        }
    }
    $('#menucustomerlist').html(customerDom);
    
    let additionalMenu = "";
    for (let item in _commonChecks) {
        if (_commonChecks[item].systems.length !== 0) {
            additionalMenu +='<li class="nav-item dropdown">' +
                '<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                    _commonChecks[item].title + ' (' + _commonChecks[item].systems.length + ')' +
                '</a>' +
                '<ul class="dropdown-menu" id="menuBlackscreen" aria-labelledby="navbarDropdown">';
                for (let system of _commonChecks[item].systems) {
                    addressComplete = system.hasOwnProperty("deployment") && system.deployment.hasOwnProperty("address") ?system.deployment.address.street + " " + system.deployment.address.houseNumber + " " + system.deployment.address.zipCode + " " + system.deployment.address.city :'Keine Adresse';
                    address = system.hasOwnProperty("deployment") && system.deployment.hasOwnProperty("address") ?system.deployment.address.street + " " + system.deployment.address.houseNumber :'<i>Keine Adresse</i>';
                    additionalMenu += '<li title="' + addressComplete + '"><a class="dropdown-item" href="display-details.html?id=' + system.id + '">' + address + '</a></li>';
                }
                additionalMenu += '</ul>' +
            '</li>';
        }
    }
    $('#additionalMenu').append(additionalMenu);
}