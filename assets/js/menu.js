var _paramsForEmail = ""
//var _commonChecks import from common
$(document).ready(function() {
	let menu = '<div class="loader" id="pageloader"></div><div class="menu_content">' +
        '<div class="side_logo">' +
            '<a href="dashboard.html" onclick="removeopenedlist()"><img src="assets/img/sideLogo.png" alt="Logo"></a>' +
        '</div>' +
        '<div class="side_menu">' +
            '<h3 class="menu_title">Menu</h3>' +
            '<ul class="navbar-nav" id="additionalMenu">' +
                '<li class="nav-item">' +
                    '<a class="nav-link" id="dash" aria-current="page" href="dashboard.html" onclick="removeopenedlist()">Dashboard</a>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle btn_openedlist" href="#" id="navbarDropdown" role="button" data-openedlist="customerlist" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Kundenliste' +
                    '</a>' +
                    '<ul class="dropdown-menu" id="menucustomerlist" aria-labelledby="navbarDropdown">' +
                        '<li><a class="dropdown-item" href="#">Kunden werden geladen...</a></li>' +
                    '</ul>' +
                '</li>' +
                '<li class="nav-item">' +
                    '<a class="nav-link" id="standorte-zuweisen" href="standorte-zuweisen.html" onclick="removeopenedlist()">Standorte zuweisen</a>' +
                '</li>' +
                '<li class="nav-item">' +
                    '<a class="nav-link" id="bestelltool" href="bestelltool.html" onclick="removeopenedlist()">Neuinstallationen</a>' +
                '</li>' +
            '</ul>' +
            '<a href="#" class="abmelden">abmelden</a>' +
        '</div>' +
        '<div class="admin_box">' +
            '<div class="admin_content">' +
                '<img src="assets/img/rocket.svg" alt="Admin">' +
                '<h5>Supportanfrage</h5>' +
                '<p class="fz12">Serviceanfrage zu dieser <br>Seite an den Admin</p>' +
                '<span class="whiteBtn sendBtn pointer">SENDEN</span>' +
            '</div>' +
            '<p class="fz8">Ein Dienst der HOMEINFO GmbH (c) 2022</p>' +
        '</div>' +
    '</div>';
    $(".menu_sidebar").html(menu);

    if (window.location.pathname.indexOf("dashboard") != -1)
        $("#dash").addClass("active");
    else if (window.location.pathname.indexOf("standorte-zuweisen") != -1)
        $("#standorte-zuweisen.html").addClass("active");
    else if (window.location.pathname.indexOf("bestelltool") != -1)
        $("#bestelltool").addClass("active");
    

    $('.sendBtn').click(function(e) {
        //$("#pageloader").show();
        let date = new Date();
        getUser().then((user)=>{
            console.log(user)
            let body = "USER: " + user.fullName + " (" + user.email + ") LINK: " + window.location.href + (window.location.href.indexOf("?") === -1 ?"?" :"%26");
            try {
                body += getParamsForEmail();
            } catch(err) {  }
            window.location.href = "mailto:r.haupt@homeinfo.de?subject=Supportanfrage Servicetool " + date.getDate() + "." + date.getMonth() + "." + date.getFullYear() + "&body=" + body;
        });
		e.preventDefault();
	});  
    getListOfSystemChecks().then(setMenu);
});

function setMenu(list) {
    list = setCheckList(list);
    let address;
    let addressComplete;
    let customers = {};
    let customerDom = "";
    list.sort(function(a, b) {
        return compare(a.deployment.customer.abbreviation.toLowerCase(), b.deployment.customer.abbreviation.toLowerCase());
    });
    // Customerlist
    for (let check of list) {
        addressComplete = check.hasOwnProperty("deployment") && check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber + " " + check.deployment.address.zipCode + " " + check.deployment.address.city :'Keine Adresse';
        address = check.hasOwnProperty("deployment") && check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber :'<i>Keine Adresse</i>';
        if (customers.hasOwnProperty(check.deployment.customer.abbreviation))
            customers[check.deployment.customer.abbreviation].count++;
        else if (check.deployment.customer.abbreviation !== "Zuordnung nicht vorhanden")
            customers[check.deployment.customer.abbreviation] = {'count':1, 'dom':'<li><a class="dropdown-item" href="listenansicht.html?customer=' + check.deployment.customer.id + '">' + (check.deployment.customer.hasOwnProperty("abbreviation") ?check.deployment.customer.abbreviation :check.deployment.customer.company.name)};
    }
    for (let customer in customers)
        customerDom += customers[customer].dom + ' (' + customers[customer].count + ')</a></li>'
    $('#menucustomerlist').html(customerDom);

    // Error list menu
    let customerErrors;
    let additionalMenu = "";
    for (let item in _commonChecks) {
        if (_commonChecks[item].systems.length !== 0 && _commonChecks[item].show) {
            _commonChecks[item].systems.sort(function(a, b) {
                return compare(a.deployment.customer.abbreviation.toLowerCase(), b.deployment.customer.abbreviation.toLowerCase());
            });
            customerErrors = {};
            additionalMenu +='<li class="nav-item dropdown">' +
                '<a class="nav-link dropdown-toggle btn_openedlist" data-openedlist="' + item + '" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                    _commonChecks[item].title + ' (' + _commonChecks[item].systems.length + ')' +
                '</a>' +
                '<ul class="dropdown-menu" aria-labelledby="navbarDropdown">';
                for (let system of _commonChecks[item].systems) {
                    if (!customerErrors.hasOwnProperty(system.deployment.customer.abbreviation))
                        customerErrors[system.deployment.customer.abbreviation] = {"id":system.deployment.customer.id, "count":0, "name":system.deployment.customer.abbreviation};
                    customerErrors[system.deployment.customer.abbreviation].count++;
                }
                for (let customer in customerErrors) {
                    additionalMenu += '<li><a class="dropdown-item" href="listenansicht.html?customer=' + customerErrors[customer].id + '&type=' + item + '">' + customer + ' (' + customerErrors[customer].count + ')</a></li>';
                }
                additionalMenu += '</ul>' +
            '</li>';
        }
    }
    $('#additionalMenu').append(additionalMenu);

    $('.btn_openedlist[data-openedlist="' + localStorage.getItem("servicetool.openedmenulist") + '"]').dropdown("toggle");
    //$("#menucustomerlist").css("max-height", "100px");
    $('.btn_openedlist').click(function(e) {
        if ($(this).data("openedlist") == localStorage.getItem("servicetool.openedmenulist"))
            removeopenedlist();
        else
            localStorage.setItem("servicetool.openedmenulist", $(this).data("openedlist"));
    })
}
function removeopenedlist() {
    localStorage.removeItem("servicetool.openedmenulist");
};