var _paramsForEmail = ""
var _list = [];
var _lastSearchSort = null;
//var _commonChecks import from common
$(document).ready(function() {
	let menu = '<div class="loader" id="pageloader"></div><div class="menu_content">' +
        '<div class="side_logo">' +
            '<a href="dashboard.html" onclick="removeopenedlist()"><img id="sysmonlogo" src="assets/img/sideLogo.png" alt="Logo"></a>' +
        '</div>' +
        '<div class="side_menu">' +
            '<h3 class="menu_title">Menu</h3>' +
            '<ul class="navbar-nav" id="additionalMenu">' +
                '<li class="nav-item">' +
                    '<a class="nav-link" id="dash" aria-current="page" href="dashboard.html" onclick="removeopenedlist()">Dashboard</a>' +
                '</li>' +
                '<li class="nav-item">' +
                    '<a class="nav-link" id="chart" aria-current="page" href="chart.html" onclick="removeopenedlist()">Chart</a>' +
                '</li>' +
                '<li class="nav-item dropdown">' +
                    '<a class="nav-link dropdown-toggle btn_openedlist customerlistLabel" href="#" id="navbarDropdown" role="button" data-openedlist="customerlist" data-bs-toggle="dropdown" aria-expanded="false">' +
                        'Kundenliste' +
                    '</a>' +
                    '<ul class="dropdown-menu" id="menucustomerlist" aria-labelledby="navbarDropdown">' +
                        '<li><a class="dropdown-item" href="#">Kunden werden geladen...</a></li>' +
                    '</ul>' +
                '</li>' +
                '<li class="nav-item">' +
                    '<a class="nav-link" id="standorte-zuweisen" href="standorte-zuweisen.html" onclick="removeopenedlist()">Standorte</a>' +
                '</li>' +
                '<li class="nav-item">' +
                    '<a class="nav-link" id="bestelltool" href="bestelltool.html" onclick="removeopenedlist()">Standort anlegen (DDB)</a>' +
                '</li>' +
                '<li class="search_dash whiteSearch" style="margin: -20px 0px 30px 0px">' +
                    '<form>' +
                        '<button type="button" id="btn_menuSystem"><img src="assets/img/search_gray.svg"></button>' +
                        '<input id="menusearch" type="search" placeholder="System suchen...">' +
                    '</form>' +
                '</li>' +
                '<li class="nav-item">' +
                    '<a class="nav-link" id="newsletter" href="newsletter.html" onclick="removeopenedlist()">Newsletter</a>' +
                '</li>' +
            '</ul>' +
        '</div>' +
        '<div class="admin_box">' +
            '<div class="admin_content">' +
                '<img src="assets/img/rocket.svg" alt="Admin">' +
                '<h5>Supportanfrage</h5>' +
                '<p class="fz12">Serviceanfrage zu dieser <br>Seite an den Admin</p>' +
                '<span class="whiteBtn sendBtn pointer">SENDEN</span>' +
            '</div>' +
            '<p class="fz8">Ein Dienst der HOMEINFO GmbH (c) 2022</p>' +
        '</div><br>' +
        '<table>' +
            '<tbody>' +
                '<tr>' +
                    '<td>Blacklist</td>' +
                    '<td>' +
                        '<input type="checkbox" style="display:none;" name="blacklist" id="blacklist">' +
                        '<label for="blacklist"><span class="btn_blacklist checkboxStyle whiteCheckbox"></span></label>' +
                    '</td>' +
                '</tr>' +
            '</tbody>' +
        '</table>' +
    '</div>';
    getAccountServices().then((data)=>{
        if (localStorage.getItem("servicetool.user") && JSON.parse(localStorage.getItem("servicetool.user")).root) {
            $(".menu_sidebar").html(menu);
            loadMenuData();
        } else {
            let rights = false;
            for (let id of data) {
                if (id.service === 30) {
                    rights = true;
                    break;
                }
            }
            if (rights) {
                $(".menu_sidebar").html(menu);
                loadMenuData();
            } else {
                menu = '<div class="loader" id="pageloader"></div><div class="menu_content">' +
                    '<div class="side_logo">' +
                        '<a href="dashboard.html" onclick="removeopenedlist()"><img id="sysmonlogo" src="assets/img/sideLogo.png" alt="Logo"></a>' +
                    '</div>' +
                    '<div class="side_menu">' +
                        '<h3 class="menu_title">Menu</h3>' +
                        '<ul class="navbar-nav">' +
                            '<li class="nav-item">' +
                                '<a class="nav-link" id="dash" aria-current="page" href="dashboard.html" onclick="removeopenedlist()">Dashboard</a>' +
                            '</li>' +
                        '</ul>' +
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
            }
        }
    });
});

function loadMenuData() {
    checkSysmon().then((sysmonIsRunning) => {
        if (sysmonIsRunning)
            $("#sysmonlogo").attr("src", "assets/img/Sysmon_check_active.gif")
    });
    let searchTable = '<div class="search_container" style="display:none">' +
        '<div class="table_contents">' +
            '<div class="tableBox">' +
                '<div class="table_container altosVers">' +
                    '<table class="table">' +
                        '<thead>' +
                            '<tr>' +
                                '<th class="searchSortCustomer pointer" data-id="sortsystemid" style="text-decoration:underline">System-ID</a></th>' +
                                '<th class="searchSortCustomer pointer" data-id="sortcustomer" style="text-decoration:underline">Kunde</a></th>' +
                                '<th class="searchSortCustomer pointer" data-id="sortcustomername" style="text-decoration:underline">Kundenname</th>' +
                                '<th class="searchSortCustomer pointer" data-id="sortaddress" style="text-decoration:underline">Adresse</th>' +
                                '<th class="searchSortCustomer pointer" data-id="sortannotation" style="text-decoration:underline">Beschreibung</th>' +
                                '<th></th>' +
                                '<th></th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody id="searchlist"></tbody>' +
                    '</table>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
    $(".dashboard_content").append(searchTable);
    $('.customerlistLabel').click(function(e) {
        getSystems().then((systems) => {
            $("#sysmonlogo").attr("title", "Systeme gecheckt / von (gesamt): " + _commonChecks.checkedToday.systems.length + " / " + _commonChecks.systemReducedByBlacklist.systems.length + " (" + systems.length + ")")
            let customerList = {};
            let sortedList = [];
            for (let system of systems) {
                if (system.hasOwnProperty("deployment")) {
                    if (!customerList.hasOwnProperty(system.deployment.customer.id))
                        customerList[system.deployment.customer.id] = {"id":system.deployment.customer.id, "name":(system.deployment.customer.hasOwnProperty("abbreviation") ?system.deployment.customer.abbreviation :system.deployment.customer.company.name), "count":1};
                    else
                        customerList[system.deployment.customer.id].count++;
                }
            }
            for (let customer in customerList)
                sortedList.push(customerList[customer]);
                sortedList.sort(function(a, b) {
                    return compare(a.name.toLowerCase(), b.name.toLowerCase());
            });
            setCustomerListWithTerminals(sortedList);
        });
        e.preventDefault();
    });
    $('.searchSortCustomer').click(function(e) {
        setSearchList($(this).data("id"));
        e.preventDefault();
    });
    $('#btn_menuSystem').click(function(e) {
        if ($("#menusearch").val() !== "")
            window.location.href = "display-details.html?id=" + $("#menusearch").val();
    });
    $('#menusearch').keydown(function(e) {
        if (e.which === 13) {
            if ($(this).val() !== "")
                window.location.href = "display-details.html?id=" + $(this).val();
            return false;
        }
        //if (isNaN(parseInt(e.key)))
            //e.preventDefault();
    });

    if (window.location.pathname.indexOf("dashboard") != -1)
        $("#dash").addClass("active");
        else if (window.location.pathname.indexOf("chart") != -1)
        $("#chart").addClass("active");
    else if (window.location.pathname.indexOf("standorte-zuweisen") != -1)
        $("#standorte-zuweisen").addClass("active");
    else if (window.location.pathname.indexOf("bestelltool") != -1)
        $("#bestelltool").addClass("active");
    else if (window.location.pathname.indexOf("newsletter") != -1)
        $("#newsletter").addClass("active");
    
    $('.sendBtn').click(function(e) {
        let date = new Date();
        getUser().then((user)=>{
            let body = "USER: " + user.fullName + " (" + user.email + ") LINK: " + window.location.href + (window.location.href.indexOf("?") === -1 ?"?" :"%26");
            try {
                body += getParamsForEmail();
            } catch(err) {  }
            window.location.href = "mailto:r.haupt@homeinfo.de,p.gunkel@homeinfo.de?subject=Supportanfrage Servicetool " + date.getDate() + "." + date.getMonth() + "." + date.getFullYear() + "&body=" + body;
        });
		e.preventDefault();
	}); 
	$('#globalsearchfield').on('input',function(e) {
        if ($(this).val() === "") {
            $(".dash_bottomCont").show();
            $(".search_container").hide();
        } else {
            setSearchList();
            $(".search_container").show();
        }
	});
    Promise.all(getListOfSystemChecks()).then(setMenu);
    if (localStorage.getItem("servicetool.userSettings") !== null && JSON.parse(localStorage.getItem("servicetool.userSettings")).blacklist) {
        $("#blacklist").prop("checked", true);
        $(".btn_blacklist").attr("title", "Blacklist deaktivieren");
    } else {
        $("#blacklist").prop("checked", false);
        $(".btn_blacklist").attr("title", "Blacklist aktivieren");
    }
    $('.btn_blacklist').click(function(e) {
        localStorage.setItem("servicetool.userSettings", JSON.stringify({"blacklist":!$("#blacklist").prop("checked")}));
        location.reload();
    });
}

function checkSysmon() {
    return $.ajax({
        url: "https://sysmon.homeinfo.de/sysmon-status",
        type: "GET",
        cache: false,
        error: function (msg) {
            console.log(msg)
            //setErrorMessage(msg, "Laden von Sysmon");
        }
    });
}

function setCustomerListWithTerminals(customerList) {
    let customerDom = "";
    for (let customer in customerList)
        customerDom += '<li><a class="dropdown-item" href="listenansicht.html?customer=' + customerList[customer].id + '">' + customerList[customer].name + ' (' + customerList[customer].count + ')</a></li>'
    $(".customerlistLabel").text("Kundenliste (" + Object.keys(customerList).length + ")");
    $('#menucustomerlist').html(customerDom);
}

function setMenu(data) {
    /*_list = */setCheckList(data[0], data[1], data[2]);
    _list = _commonChecks.system.systems;
    _list.sort(function(a, b) {
        return compare(a.deployment.customer.abbreviation.toLowerCase(), b.deployment.customer.abbreviation.toLowerCase());
    });
    // Error list menu
    let customerErrors;
    let additionalMenu = "";
    for (let item in _commonChecks) {
        if (_commonChecks[item].widget && _commonChecks[item].systems.length !== 0) {
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

    $("#sysmonlogo").attr("title", _commonChecks.checkedToday.systems.length + " / " + _commonChecks.systemReducedByBlacklist.systems.length)
    $('.btn_openedlist[data-openedlist="' + localStorage.getItem("servicetool.openedmenulist") + '"]').dropdown("toggle");
    if ($('.btn_openedlist').hasClass('customerlistLabel'))
        $(".customerlistLabel").click();
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

function setSearchList(sort = "sortcustomer") {
    sortSearchList(sort);
    let searchDom = '';
    let address;
    let abbreviation;
    let name;
    let annotation
    $(".dash_bottomCont").hide();
    for (let check of _list) {
        address = check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber + " " + check.deployment.address.zipCode + " " + check.deployment.address.city :'Nicht angegeben';
        abbreviation = check.deployment.customer.hasOwnProperty("abbreviation") ?check.deployment.customer.abbreviation :"Zuordnung nicht vorhanden";
        name = check.deployment.customer.hasOwnProperty("company") && check.deployment.customer.company.hasOwnProperty("name") ?check.deployment.customer.company.name :"";
        annotation = (check.deployment.hasOwnProperty("annotation") ?check.deployment.annotation :"");
        if (check.id.toString().indexOf($('#globalsearchfield').val().toLowerCase()) !== -1 || address.toLowerCase().indexOf($('#globalsearchfield').val().toLowerCase()) !== -1 || abbreviation.toLowerCase().indexOf($('#globalsearchfield').val().toLowerCase()) !== -1 || name.toLowerCase().indexOf($('#globalsearchfield').val().toLowerCase()) !== -1 || annotation.toString().toLowerCase().indexOf($('#globalsearchfield').val().toLowerCase()) !== -1) {
            searchDom += '<tr class="system" data-id="' + check.id + '">' +
                '<td>' + check.id + '</td>' +
                '<td>' + abbreviation + '</td>' +
                '<td>' + name + '</td>' +
                '<td style="white-space: nowrap;">' + address + '</td>' +
                '<td>' + annotation + '</td>' +
                '<td width="50px"><span title="System befindet sich in der Blacklist">' + (check.hasOwnProperty("blacklist") ?_coffin :'') + '</span></td>' +
                '<td><a href="display-details.html?id=' + check.id + '" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>' +
            '</tr>';
        }
    }
    searchDom = searchDom === '' ?"<tr><td>Keine Übereinstimmungen gefunden</td></tr>" :searchDom;
    $("#searchlist").html(searchDom);
}
function sortSearchList(sort) {
    _lastSearchSort = _lastSearchSort === sort && _lastSearchSort.indexOf('inverted' === -1) ? _lastSearchSort + "Inverted" :sort;
    if (_lastSearchSort === "sortsystemid") {
        _list.sort(function(a, b) {
            return compare(a.id, b.id);
        });
    } else if (_lastSearchSort === "sortsystemidInverted") {
        _list.sort(function(a, b) {
            return compareInverted(a.id, b.id);
        });
    } else if (_lastSearchSort === "sortcustomer") {
        _list.sort(function(a, b) {
            let nameA = a.deployment.customer.hasOwnProperty("company") && a.deployment.customer.company.hasOwnProperty("name") ?a.deployment.customer.company.name :"";
            let nameB = b.deployment.customer.hasOwnProperty("company") && b.deployment.customer.company.hasOwnProperty("name") ?b.deployment.customer.company.name :"";
            return compare(nameA.toLowerCase(), nameB.toLowerCase());
        });
    } else if (_lastSearchSort === "sortcustomerInverted") {
        _list.sort(function(a, b) {
            let nameA = a.deployment.customer.hasOwnProperty("company") && a.deployment.customer.company.hasOwnProperty("name") ?a.deployment.customer.company.name :"";
            let nameB = b.deployment.customer.hasOwnProperty("company") && b.deployment.customer.company.hasOwnProperty("name") ?b.deployment.customer.company.name :"";
            return compareInverted(nameA.toLowerCase(), nameB.toLowerCase());
        });
    } else if (_lastSearchSort === "sortcustomername") {
        _list.sort(function(a, b) {
            let abbreviationA = a.deployment.customer.hasOwnProperty("abbreviation") ?a.deployment.customer.abbreviation :"Zuordnung nicht vorhanden";
            let abbreviationB = b.deployment.customer.hasOwnProperty("abbreviation") ?b.deployment.customer.abbreviation :"Zuordnung nicht vorhanden";
            return compare(abbreviationA.toLowerCase(), abbreviationB.toLowerCase());
        });
    } else if (_lastSearchSort === "sortcustomernameInverted") {
        _list.sort(function(a, b) {
            let abbreviationA = a.deployment.customer.hasOwnProperty("abbreviation") ?a.deployment.customer.abbreviation :"Zuordnung nicht vorhanden";
            let abbreviationB = b.deployment.customer.hasOwnProperty("abbreviation") ?b.deployment.customer.abbreviation :"Zuordnung nicht vorhanden";
            return compareInverted(abbreviationA.toLowerCase(), abbreviationB.toLowerCase());
        });
    } else if (_lastSearchSort == "sortaddress") {
        _list.sort(function(a, b) {
            let addressA = a.deployment.hasOwnProperty("address") ?a.deployment.address.street + " " + a.deployment.address.houseNumber + " " + a.deployment.address.zipCode + " " + a.deployment.address.city :'Nicht angegeben';
            let addressB = b.deployment.hasOwnProperty("address") ?b.deployment.address.street + " " + b.deployment.address.houseNumber + " " + b.deployment.address.zipCode + " " + b.deployment.address.city :'Nicht angegeben';
            return compare(addressA.toLowerCase(), addressB.toLowerCase());
        });
    } else if (_lastSearchSort == "sortaddressInverted") {
        _list.sort(function(a, b) {
            let addressA = a.deployment.hasOwnProperty("address") ?a.deployment.address.street + " " + a.deployment.address.houseNumber + " " + a.deployment.address.zipCode + " " + a.deployment.address.city :'Nicht angegeben';
            let addressB = b.deployment.hasOwnProperty("address") ?b.deployment.address.street + " " + b.deployment.address.houseNumber + " " + b.deployment.address.zipCode + " " + b.deployment.address.city :'Nicht angegeben';
            return compareInverted(addressA.toLowerCase(), addressB.toLowerCase());
        });
    } else if (_lastSearchSort == "sortannotation") {
        _list.sort(function(a, b) {
            let annotationA = (a.deployment.hasOwnProperty("annotation") ?a.deployment.annotation :"");
            let annotationB = (b.deployment.hasOwnProperty("annotation") ?b.deployment.annotation :"");
            return compare(annotationA.toLowerCase(), annotationB.toLowerCase());
        });
    } else if (_lastSearchSort == "sortannotationInverted") {
        _list.sort(function(a, b) {
            let annotationA = (a.deployment.hasOwnProperty("annotation") ?a.deployment.annotation :"");
            let annotationB = (b.deployment.hasOwnProperty("annotation") ?b.deployment.annotation :"");
            return compareInverted(annotationA.toLowerCase(), annotationB.toLowerCase());
        });
    }
}