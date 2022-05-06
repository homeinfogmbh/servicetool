var _paramsForEmail = ""
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
                    '<a class="nav-link dropdown-toggle btn_openedlist" href="#" id="navbarDropdown" role="button" data-openedlist="customerlist" data-bs-toggle="dropdown" aria-expanded="false">' +
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
                '<span class="whiteBtn sendBtn pointer">SENDEN</span>' +
            '</div>' +
            '<p class="fz8">Ein Dienst der HOMEINFO GmbH (c) 2022</p>' +
        '</div>' +
    '</div>';
    $(".menu_sidebar").html(menu);

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
        //html2canvas(document.querySelector("body")).then(canvas => {
            //$("#pageloader").hide();
            //const base64image = canvas.toDataURL("image/png");
            //window.location.href = base64image;
            //document.body.appendChild(canvas)
            //window.open("", "_blank");
            //window.location.href = '<img src="data:image/jpg;base64,' + canvas+ '" />';
            //window.location.href = "mailto:r.haupt@homeinfo.de?subject=Supportanfrage Servicetool " + date.getDate() + "." + date.getMonth() + "." + date.getFullYear() + "&body=Screenshot"; // canvas.toDataURL("image/jpeg", 1.0);
        //});
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
    for (let check of list) {
        addressComplete = check.hasOwnProperty("deployment") && check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber + " " + check.deployment.address.zipCode + " " + check.deployment.address.city :'Keine Adresse';
        address = check.hasOwnProperty("deployment") && check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber :'<i>Keine Adresse</i>';
        // Customerlist
        if (customers.hasOwnProperty(check.deployment.customer.abbreviation))
            customers[check.deployment.customer.abbreviation].count++;
        else if (check.deployment.customer.abbreviation !== "Zzuordnung nicht vorhanden")
            customers[check.deployment.customer.abbreviation] = {'count':1, 'dom':'<li><a class="dropdown-item" href="listenansicht.html?customer=' + check.deployment.customer.id + '">' + (check.deployment.customer.hasOwnProperty("abbreviation") ?check.deployment.customer.abbreviation :check.deployment.customer.company.name)};
    }
    for (let customer in customers)
        customerDom += customers[customer].dom + ' (' + customers[customer].count + ')</a></li>'
    $('#menucustomerlist').html(customerDom);

    let additionalMenu = "";
    for (let item in _commonChecks) {
        if (_commonChecks[item].systems.length !== 0 && _commonChecks[item].show) {
            _commonChecks[item].systems.sort(function(a, b) {
                return compare(a.deployment.address.street.toLowerCase(), b.deployment.address.street.toLowerCase());
            });
            additionalMenu +='<li class="nav-item dropdown">' +
                '<a class="nav-link dropdown-toggle btn_openedlist" data-openedlist="' + item + '" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                    _commonChecks[item].title + ' (' + _commonChecks[item].systems.length + ')' +
                '</a>' +
                '<ul class="dropdown-menu" aria-labelledby="navbarDropdown">';
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
    localStorage.removeItem("servicetool.openedmenulist");
    $('.btn_openedlist[data-openedlist="' + localStorage.getItem("servicetool.openedmenulist") + '"]').next().addClass("show");
    /*
    $('.btn_openedlist').click(function(e) {
        console.log($(this).next().hasClass("show"))
        if ($(this).next().hasClass("show")) {
            $(this).next().removeClass("show");
            localStorage.removeItem("servicetool.openedmenulist");
        } else {
            $('.btn_openedlist[data-openedlist="' + localStorage.getItem("servicetool.openedmenulist") + '"]').next().removeClass("show");
            $(this).next().addClass("show");
            localStorage.setItem("servicetool.openedmenulist", $(this).data("openedlist"));
        }
    })
    */
}