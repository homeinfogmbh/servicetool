var _type;
var _customer;
var _lastsort = null;
var _operatingSystemsShorts = {"Arch Linux":"Arch", "Windows XP Embedded":"XPe", "Windows XP":"XP", "Windows 8":"Win8", "Windows 7 Embedded":"Win7e", "Windows 7":"Win7", "Windows 10":"Win10"};
var _imagesLoaded = {'simultaneous':5, 'started':0, 'finished':0, 'systemsToCheck':[]};
var _customerOfflineList = [];
var _systemsCountByCustomer = [];
$(document).ready(function() {
    _type = _commonChecks.hasOwnProperty(getURLParameterByName('type')) ?getURLParameterByName('type') :'system';
    _customer = getURLParameterByName('customer');
    Promise.all(getListOfSystemChecks()).then((data)=>{
        setCheckList(data[0], data[1], data[2]);
        //if (_customer === null) {
          //  setList();
        //} else {
            // Get all systems without deployment
            getSystems().then((systems) => {
                let found;
                for (let system of systems) {
                    if (system.hasOwnProperty("deployment")) {
                        if (!_systemsCountByCustomer.hasOwnProperty(system.deployment.customer.id))
                            _systemsCountByCustomer[system.deployment.customer.id] = {"count":0};
                        _systemsCountByCustomer[system.deployment.customer.id].count++;
                        found = false;
                        for (let checkedSystem of _commonChecks.system.systems) {
                            if (system.id === checkedSystem.id) {
                                if (system.deployment.hasOwnProperty('technicianAnnotation'))
                                    checkedSystem.deployment.technicianAnnotation = system.deployment.technicianAnnotation;
                                found = true;
                                break;
                            }
                        }
                        // Show systems with now checks, but dont show in error list, only customer lists or "ALL"
                        if (!found && (_customer != null || !window.location.href.includes('?')))
                            _commonChecks[_type].systems.push(system); //_commonChecks.system.systems.push(system);
                    }
                }
                setList();
            });
       // }
    });
    $('#searchfield').val(getURLParameterByName('filter') !== null ? getURLParameterByName('filter') :"");
    $(".dashTopLeft").html('<h2>' + _commonChecks[_type].title + '</h2><p>' + _commonChecks[_type].text + '</p>');
	$('#searchfield').on('input',function(e) {
		setList();
	});
    $(document).keypress(function(e) {
        if(e.which == 13) { // 'enter'
            e.preventDefault();
        }
    });
    $('.sortCustomer').click(function(e) {
        setList($(this).data("id"));
		e.preventDefault();
	}); 
    $('#btn_screenshot_online').click(function() {
        screenshotLoader();
    });
    $('.btn_copyID').click(function(e) {
        let copy = "";
        let addressComplete;
        let name;
        for (let check of _commonChecks[_type].systems) {
            if (_customer == null || _customer == check.deployment.customer.id) {
                addressComplete = check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber + ", " + check.deployment.address.zipCode + " " + check.deployment.address.city :'Nicht angegeben';
                name = check.deployment.customer.hasOwnProperty("company") && check.deployment.customer.company.hasOwnProperty("name") ?check.deployment.customer.company.name :"";
                if ($('#searchfield').val().length === 0 || (check.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1 || addressComplete.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.abbreviation.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || name.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1))
                    copy += check.id + "\r\n";
            }
        }
        navigator.clipboard.writeText(copy);
		e.preventDefault();
	});
    $('.btn_copyAddress').click(function(e) {
        let copy = "";
        let addressComplete;
        let name;
        for (let check of _commonChecks[_type].systems) {
            if (_customer == null || _customer == check.deployment.customer.id) {
                addressComplete = check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber + (check.deployment.hasOwnProperty("annotation") ?" (" + check.deployment.annotation + ")" :"") + ", " + check.deployment.address.zipCode + " " + check.deployment.address.city :'Nicht angegeben';
                name = check.deployment.customer.hasOwnProperty("company") && check.deployment.customer.company.hasOwnProperty("name") ?check.deployment.customer.company.name :"";
                if ($('#searchfield').val().length === 0 || (check.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1 || addressComplete.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.abbreviation.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || name.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1))
                    copy += addressComplete + "\r\n";
            }
        }
        navigator.clipboard.writeText(copy);
		e.preventDefault();
	});
});

function setList(sort = "sortcustomer") {
    sortCommonList(sort);
    let systemlistDOM = "";
    let address;
    let addressComplete;
    let counter = 0;
    let abbreviation;
    let name;
    let downloadAvailable;
    let uploadAvailable;
    let noCheckStyle;
    let customerOfflineListTMP = {};
    let customerofflinelistset = _customerOfflineList.length == 0;
    for (let check of _commonChecks[_type].systems) {
        addressComplete = check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber + ", " + check.deployment.address.zipCode + " " + check.deployment.address.city :'Nicht angegeben';
        if (_customer == null || _customer == check.deployment.customer.id) {
            name = check.deployment.customer.hasOwnProperty("company") && check.deployment.customer.company.hasOwnProperty("name") ?check.deployment.customer.company.name :"";
            if ($('#searchfield').val().length === 0 || (check.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1 || addressComplete.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.abbreviation.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || name.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1)) {
                address = check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber :'';
                abbreviation = check.deployment.customer.abbreviation === "Zuordnung nicht vorhanden" ?'<i>' + check.deployment.customer.abbreviation + '</i>' :check.deployment.customer.abbreviation;
                downloadAvailable = check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("download") ?true :false;
                uploadAvailable = check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("upload") ?true :false;
                noCheckStyle = check.hasOwnProperty("checkResults") && check.checkResults.length > 0 ?"" :'style="background-color:gray"';
                systemlistDOM += '<tr class="system" data-id="' + check.id + '">' +
                    '<td>' + (counter+1) + '</td>' +
                    '<td>' + check.id + '</td>' +
                    '<td>' + abbreviation + '</td>' +
                    '<td title="' + addressComplete + '"><span style="white-space: nowrap;">' + address + (check.deployment.hasOwnProperty("annotation") && check.deployment.annotation != ""?"</span> (" + check.deployment.annotation + ")" :"") + 
                        ' <a href="#" class="editIcon btn_changeDeploymentAddress" data-street="' + check.deployment.address.street + '" data-housenumber="' + check.deployment.address.houseNumber + '" data-zipcode="' + check.deployment.address.zipCode + '" data-city="' + check.deployment.address.city + '" data-annotation="' + (check.deployment.hasOwnProperty("annotation") ?check.deployment.annotation :"") + '"><img src="assets/img/edit.svg" alt=""></a>' +
                        '<div id="deploymentAddressfields" style="display:none; padding-top:5px">' +							
                            '<div class="dualinp inpCol Straße">' +
                                '<div class="autocomplete-wrapper">' +
                                    '<input id="deploymentAddressStreetInput" type="text" placeholder="Straße" class="longInp basic-data">' +
                                '</div>' +
                                '<input id="deploymentAddressHouseNumberInput" type="text" placeholder="Nr." class="smallInp basic-data">' +
                            '</div>' +
                            '<div class="dualinp inpCol PLZ">' +
                                '<input id="deploymentAddressZipCodeInput" type="text" placeholder="PLZ" class="smallInp basic-data">' +
                                '<input id="deploymentAddressCityInput" type="text" placeholder="Stadt" class="longInp basic-data">' +
                            '</div>' +
                            '<div class="dualinp inpCol Straße">' +
                                '<input id="deploymentAnnotationInput" type="text" placeholder="Adresszusatz" class="longInp basic-data">' +
                            '</div>' +
                            '<div style="float:right">' +
                                '<span class="whiteMark btn_saveDeploymentAddress pointer" data-id="' + check.deployment.id + '" data-customerid="' + check.deployment.customer.id + '">Speichern</span>' +
                                '<span class="whiteMark btn_changeDeploymentAddressHide pointer">Abbrechen</span>' +
                            '</div>' +
                        '</div>' +
                    '</td>' + 
                    '<td><span ' + noCheckStyle + ' class="' + (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && !check.checkResults[0].online /*check.checkResults[0].sshLogin === "failed" && !check.checkResults[0].icmpRequest*/ /*&& check.fitted && !check.deployment.testing*/ ?'orangeCircle' :'blueCircle') + '"></span></td>' +
                    '<td><span class="' + (!check.fitted ?'orangeCircle' :'blueCircle') + '"></span></td>' +
                    '<td><span class="' + (check.testing ?"orangeCircle":"blueCircle") + '"></span></td>' +
                    '<td>' + (check.hasOwnProperty("lastSync") ?formatDate(check.lastSync) + " (" + check.lastSync.substring(11, 16) + "h)": "noch nie") + '</td>' +
                    '<td>' + (downloadAvailable && check.checkResults[0].download*_KIBIBITTOMBIT < 1.9?'<span class="orangeMark">' + (check.checkResults[0].download*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>':downloadAvailable ?'<span class="blueMark">' + (check.checkResults[0].download*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>':' - ') +
                    (uploadAvailable && check.checkResults[0].upload*_KIBIBITTOMBIT < 0.35?'<span class="orangeMark">' + (check.checkResults[0].upload*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>':uploadAvailable ?'<span class="blueMark">' + (check.checkResults[0].upload*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>':' - ') + '</td>' +
                    '<td>' + 
                        '<span class="btn_technicianAnnotation">' + (check.deployment.hasOwnProperty('technicianAnnotation') ?check.deployment.technicianAnnotation.length > 20 ?check.deployment.technicianAnnotation.substring(0,20) + "..." + ' <a href="#" class="editIcon"><img src="assets/img/edit.svg" alt=""></a>':check.deployment.technicianAnnotation + ' <a href="#" class="editIcon"><img src="assets/img/edit.svg" alt=""></a>':'<a href="#" class="editIcon"><img src="assets/img/edit.svg" alt=""></a>') + '</span>' +
                        '<div id="technicianAnnotationfields" style="display:none; padding-top:5px">' +
                            '<div class="dualinp inpCol">' +
                                '<textarea id="technicianAnnotationInput" class="technicianAnnotationInput longInp basic-data" style=resize:auto;">' + (check.deployment.hasOwnProperty('technicianAnnotation') ?check.deployment.technicianAnnotation :"") + '</textarea>' +
                            '</div>' +
                            '<div style="float:right">' +
                                '<span class="whiteMark btn_saveTechnicianAnnotation pointer" data-deployment="' + check.deployment.id + '">Speichern</span>' +
                                '<span class="whiteMark btn_closeTechnicianAnnotation pointer">Abbrechen</span>' +
                            '</div>' +
                        '</div>' +
                    '</td>' +
                    '<td><span ' + noCheckStyle + ' class="' + (check.ddbOs ?"yellowCircle":"whiteCircle") + '"></span></td>' +
                    '<td><span class="whiteMark" style="min-width:auto; display:block" title="Betriebssystem">' + (_operatingSystemsShorts.hasOwnProperty(check.operatingSystem) ?_operatingSystemsShorts[check.operatingSystem] :check.operatingSystem) + ' ' + '</span></td>' +
                    '<td style="min-width:50px"><span title="System befindet sich in der Blacklist">' + (check.hasOwnProperty("blacklist") ?_coffin :'') + '</span></td>' +
                    '<td><a href="display-details.html?id=' + check.id + '" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>'+
                    '<td><span class="screenshot" data-id="' + check.id + '"></span></td>' +
                '</tr>';
                counter++;
                if (_type == "offline" && customerofflinelistset && check.deployment.customer.id != -1) {
                    if (customerOfflineListTMP.hasOwnProperty(check.deployment.customer.id))
                        customerOfflineListTMP[check.deployment.customer.id].offline++;
                    else
                        customerOfflineListTMP[check.deployment.customer.id] = {"customer":check.deployment.customer.id, "offline":1, "name":check.deployment.customer.company.name, "countAll": _systemsCountByCustomer[check.deployment.customer.id].count};
                }
            }
        }
    }
    for (let customer in customerOfflineListTMP)
        _customerOfflineList.push(customerOfflineListTMP[customer]);
    sortCommonList("offlinecustomersortcustomer");

    systemlistDOM = systemlistDOM === "" ?"<tr><td>Keine Einträge vorhanden</td></tr>" :systemlistDOM;
    $("#systemlist").html(systemlistDOM);

    if (_type == "offline" && $('#searchfield').val().length === 0)
        setCustomerOfflineList();
    else
        $("#offlinecustomertable").hide();
    
    $('.btn_changeDeploymentAddress').click(function(e) {
        $(this).parent().find("#deploymentAddressStreetInput").val($(this).data("street"));
        $(this).parent().find("#deploymentAddressHouseNumberInput").val($(this).data("housenumber"));
        $(this).parent().find("#deploymentAddressZipCodeInput").val($(this).data("zipcode"));
        $(this).parent().find("#deploymentAddressCityInput").val($(this).data("city"));
        $(this).parent().find("#deploymentAnnotationInput").val($(this).data("annotation"));
        if ($(this).parent().find("#deploymentAddressfields").is(":visible"))
            $(this).parent().find("#deploymentAddressfields").hide();
        else
            $(this).parent().find("#deploymentAddressfields").show();
        $(this).parent().find("#deploymentAddressStreetInput").focus();
        e.preventDefault();
    });
    $('.btn_changeDeploymentAddressHide').click(function(e) {
            $(this).parent().parent().hide();
        e.preventDefault();
    });
    $('.btn_saveDeploymentAddress').click(function(e) {
        let thisobject = $(this);
        let address = {'street': thisobject.parent().parent().find("#deploymentAddressStreetInput").val(), 'houseNumber':thisobject.parent().parent().find("#deploymentAddressHouseNumberInput").val(), 'zipCode':thisobject.parent().parent().find("#deploymentAddressZipCodeInput").val(), 'city':thisobject.parent().parent().find("#deploymentAddressCityInput").val()};
        let annotation = thisobject.parent().parent().find("#deploymentAnnotationInput").val();
        let system = {'deployment':{'id':thisobject.data('id'), 'customer':{'id':thisobject.data('customerid')}}};

        changeDeployment("annotation", annotation, system).then(() => {
            changeDeployment("address", address, system).then(() => {
                localStorage.removeItem("servicetool.systemchecks");
                thisobject.parent().parent().parent().attr('title', thisobject.parent().parent().find("#deploymentAddressStreetInput").val() + " " + thisobject.parent().parent().find("#deploymentAddressHouseNumberInput").val() + ", " + thisobject.parent().parent().find("#deploymentAddressZipCodeInput").val() + " " + thisobject.parent().parent().find("#deploymentAddressCityInput").val());
                thisobject.parent().parent().parent().text(thisobject.parent().parent().find("#deploymentAddressStreetInput").val() + " " + thisobject.parent().parent().find("#deploymentAddressHouseNumberInput").val() + (thisobject.parent().parent().find("#deploymentAnnotationInput").val() != "" ?" (" + thisobject.parent().parent().find("#deploymentAnnotationInput").val() + ")":""));
                thisobject.parent().parent().hide();
                $("#pageloader").hide()
            });
        });
        e.preventDefault();
    });
    
    $('.btn_technicianAnnotation').click(function(e) {
        if ($(this).parent().find("#technicianAnnotationfields").is(":visible"))
            $(this).parent().find("#technicianAnnotationfields").hide();
        else
            $(this).parent().find("#technicianAnnotationfields").show();
        $(this).parent().find('#technicianAnnotationInput').focus();
		e.preventDefault();
    });
    $('.technicianAnnotationInput').keydown(function(e) {
        if (e.which === 13) {
            e.preventDefault();
            this.value = this.value.substring(0, this.selectionStart) + "" + "\n" + this.value.substring(this.selectionEnd, this.value.length);
        }
    });
    $('.btn_closeTechnicianAnnotation').click(function(e) {
        $(this).parent().parent().parent().find('.btn_technicianAnnotation').click();
		e.preventDefault();
    });
    $('.btn_saveTechnicianAnnotation').click(function(e) {
            let technicianAnnotation = $(this).parent().parent().parent().find('#technicianAnnotationInput').val().trim() === "" ?null :$(this).parent().parent().parent().find('#technicianAnnotationInput').val();
            saveTechnicianAnnotation($(this).data('deployment'), technicianAnnotation).then(() => {
                $(this).parent().parent().parent().find('.btn_technicianAnnotation').text(technicianAnnotation === null ?"" :technicianAnnotation);
                $(this).parent().parent().parent().find("#technicianAnnotationfields").hide();
                $("#pageloader").hide()
            });
		e.preventDefault();
	});
    $(".dashTopLeft").html('<h2>' + (_customer == null?_commonChecks[_type].title :'Displays für ' + abbreviation) + ' (' + counter + ')</h2><p>' + (_customer == null ?_commonChecks[_type].text :'Liste aller Displays für ' +  name + ' (' + _customer + ')') + '</p>');
    $("#pageloader").hide();
}

function setCustomerOfflineList() {
    let customerlistDOM = "";
    for (let customer in _customerOfflineList) {
        customerlistDOM += "<tr>" +
            "<td>" + _customerOfflineList[customer].customer + "</td>" +
            "<td>" + _customerOfflineList[customer].name + "</td>" +
            "<td>" + _customerOfflineList[customer].countAll + "</td>" +
            "<td>" + _customerOfflineList[customer].offline + "</td>" +
            '<td><a href="listenansicht.html?customer=' + _customerOfflineList[customer].customer + '" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>'+
        "</tr>";
    }
    customerlistDOM = customerlistDOM === "" ?"<tr><td>Keine Einträge vorhanden</td></tr>" :customerlistDOM;
    $("#customerofflinelist").html(customerlistDOM);
    $("#offlinecustomertable").show();
}

function sortCommonList(sort) {
    if (_lastsort === null && getURLParameterByName('sort') !== null)
        _lastsort = getURLParameterByName('sort');
    else
        _lastsort = _lastsort === sort && _lastsort.indexOf('inverted' === -1) ? _lastsort + "Inverted" :sort;
    if (_lastsort === "sortsystemid") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return compare(a.id, b.id);
        });
    } else if (_lastsort === "sortsystemidInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return compareInverted(a.id, b.id);
        });
    } else if (_lastsort === "sortcustomer") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return compare(a.deployment.customer.abbreviation.toLowerCase(), b.deployment.customer.abbreviation.toLowerCase());
        });
    } else if (_lastsort === "sortcustomerInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return compareInverted(a.deployment.customer.abbreviation.toLowerCase(), b.deployment.customer.abbreviation.toLowerCase());
        });
    } else if (_lastsort == "sortaddress") {
        _commonChecks[_type].systems.sort(function(a, b) {
            let housenumberA = a.deployment.address.houseNumber.padStart(5, "0");
            let housenumberB = b.deployment.address.houseNumber.padStart(5, "0");
            return compare(a.deployment.address.street.toLowerCase() + housenumberA, b.deployment.address.street.toLowerCase()+housenumberB);
        });
    } else if (_lastsort == "sortaddressInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            let housenumberA = a.deployment.address.houseNumber.padStart(5, "0");
            let housenumberB = b.deployment.address.houseNumber.padStart(5, "0");
            return compareInverted(a.deployment.address.street.toLowerCase()+housenumberA, b.deployment.address.street.toLowerCase()+housenumberB);
        });
    } else if (_lastsort == "sortonline") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return a.hasOwnProperty("checkResults") && !a.checkResults[0].online /*a.checkResults[0].sshLogin === "failed" && !a.checkResults[0].icmpRequest*/ /*&& a.fitted && !a.deployment.testing*/ ?-1 :b.hasOwnProperty("checkResults") && !b.checkResults[0].online /*b.checkResults[0].sshLogin === "failed" && !b.checkResults[0].icmpRequest*/ /*&& b.fitted && !b.deployment.testing*/ ?1 :0
        });
    } else if (_lastsort == "sortonlineInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return a.hasOwnProperty("checkResults") && !b.checkResults[0].online /*b.checkResults[0].sshLogin === "failed" && !b.checkResults[0].icmpRequest*/ /*&& b.fitted && !b.deployment.testing*/ ?-1 :a.hasOwnProperty("checkResults") && !a.checkResults[0].online /*a.checkResults[0].sshLogin === "failed" && !a.checkResults[0].icmpRequest*/ /*&& b.fitted && !a.deployment.testing*/ ?1 :0
        });
    } else if (_lastsort == "sortfitted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return b.fitted ?-1 : a.fitted?1 :0
        });
    } else if (_lastsort == "sortfittedInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return a.fitted ?-1 : b.fitted?1 :0
        });
    } else if (_lastsort == "sortssd") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return a.hasOwnProperty("checkResults") && a.checkResults[0].smartCheck === "failed" ?-1 :b.hasOwnProperty("checkResults") && b.checkResults[0].smartCheck === "failed"?1 :0
        });
    } else if (_lastsort == "sortssdInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return b.hasOwnProperty("checkResults") && b.checkResults[0].smartCheck === "failed" ?-1 :a.hasOwnProperty("checkResults") && a.checkResults[0].smartCheck === "failed"?1 :0
        });
    } else if (_lastsort == "sortapprunning") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return a.hasOwnProperty("checkResults") && a.checkResults[0].applicationState === "not running" ?-1 :b.hasOwnProperty("checkResults") && b.checkResults[0].applicationState === "not running" ?1 :0
        });
    } else if (_lastsort == "sortapprunningInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return b.hasOwnProperty("checkResults") && b.checkResults[0].applicationState === "not running" ?-1 :a.hasOwnProperty("checkResults") && a.checkResults[0].applicationState === "not running" ?1 :0
        });
        /*
    } else if (_lastsort == "sortappuptodate") {
        _commonChecks[_type].systems.sort(function(a, b) {
            if (a.checkResults[0].applicationVersion === undefined && b.checkResults[0].applicationVersion !== undefined)
                return 1;
            if (b.checkResults[0].applicationVersion === undefined && a.checkResults[0].applicationVersion !== undefined)
                return -1;
            if (a.checkResults[0].applicationVersion < b.checkResults[0].applicationVersion)
                return -1;
            if (a.checkResults[0].applicationVersion > b.checkResults[0].applicationVersion)
                return 1;
            return 0;
        });
    } else if (_lastsort == "sortappuptodateInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            if (a.checkResults[0].applicationVersion === undefined && b.checkResults[0].applicationVersion !== undefined)
                return 1;
            if (b.checkResults[0].applicationVersion === undefined && a.checkResults[0].applicationVersion !== undefined)
                return -1;
            if (a.checkResults[0].applicationVersion > b.checkResults[0].applicationVersion)
                return -1;
            if (a.checkResults[0].applicationVersion < b.checkResults[0].applicationVersion)
                return 1;
        return 0;
        });
        */
    } else if (_lastsort == "sortsync") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return !b.hasOwnProperty("lastSync") ?-1 :!a.hasOwnProperty("lastSync") ?1 :compareInverted(a.lastSync.toLowerCase(), b.lastSync.toLowerCase());            
        });
    } else if (_lastsort == "sortsyncInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return !a.hasOwnProperty("lastSync") ?-1 :!b.hasOwnProperty("lastSync") ?1 :compare(a.lastSync.toLowerCase(), b.lastSync.toLowerCase());            
        });
    } else if (_lastsort == "sortdownupload") {
        let downloadAvailableA;
        let downloadAvailableB;
        let downloadNOTOKA;
        let downloadNOTOKB;
        _commonChecks[_type].systems.sort(function(a, b) {
            downloadAvailableA = a.hasOwnProperty("checkResults") && a.checkResults.length > 0 && a.checkResults[0].hasOwnProperty("download") ?true :false;
            downloadAvailableB = b.hasOwnProperty("checkResults") && b.checkResults.length > 0 && b.checkResults[0].hasOwnProperty("download") ?true :false;
            downloadNOTOKA = downloadAvailableA && a.checkResults[0].download*_KIBIBITTOMBIT < 1.9;
            downloadNOTOKB = downloadAvailableB && b.checkResults[0].download*_KIBIBITTOMBIT < 1.9;
            if (!downloadAvailableA)
                return 1;
            if (!downloadAvailableB)
                return -1;
            return downloadNOTOKA ?-1 :downloadNOTOKB ?1 :0;
        });
    } else if (_lastsort == "sortdownuploadInverted") {
        let downloadAvailableA;
        let downloadAvailableB;
        let downloadNOTOKA;
        let downloadNOTOKB;
        _commonChecks[_type].systems.sort(function(a, b) {
            downloadAvailableA = a.hasOwnProperty("checkResults") && a.checkResults.length > 0 && a.checkResults[0].hasOwnProperty("download") ?true :false;
            downloadAvailableB = b.hasOwnProperty("checkResults") && b.checkResults.length > 0 && b.checkResults[0].hasOwnProperty("download") ?true :false;
            downloadNOTOKA = downloadAvailableA && a.checkResults[0].download*_KIBIBITTOMBIT < 1.9;
            downloadNOTOKB = downloadAvailableB && b.checkResults[0].download*_KIBIBITTOMBIT < 1.9;
            if (!downloadAvailableB)
                return 1;
            if (!downloadAvailableA)
                return -1;
            return downloadNOTOKB ?-1 :downloadNOTOKA ?1 :0;
        });
    } else if (_lastsort === "sortannotation") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return !b.deployment.hasOwnProperty("technicianAnnotation") ?-1 :!a.deployment.hasOwnProperty("technicianAnnotation") ?1 :compareInverted(a.deployment.technicianAnnotation, b.deployment.technicianAnnotation);
        });
    } else if (_lastsort === "sortannotationInverted") {
            _commonChecks[_type].systems.sort(function(a, b) {
                return !a.deployment.hasOwnProperty("technicianAnnotation") ?-1 :!b.deployment.hasOwnProperty("technicianAnnotation") ?1 :compare(a.deployment.technicianAnnotation, b.deployment.technicianAnnotation);
        });
    } else if (_lastsort == "sortddbos") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return a.ddbOs ?-1 :b.ddbOs ?1 :0
        });
    } else if (_lastsort == "sortddbosInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return b.ddbOs ?-1 :a.ddbOs ?1 :0
        });        
    } else if (_lastsort == "offlinecustomersortid") {
        _customerOfflineList.sort(function(a, b) {
            return compare(a.customer, b.customer);
        });
    } else if (_lastsort == "offlinecustomersortidInverted") {
        _customerOfflineList.sort(function(a, b) {
            return compareInverted(a.customer, b.customer);
        });
    } else if (_lastsort == "offlinecustomersortcustomer") {
        _customerOfflineList.sort(function(a, b) {
            return compare(a.name.toLowerCase(), b.name.toLowerCase());
        });
    } else if (_lastsort == "offlinecustomersortcustomerInverted") {
        _customerOfflineList.sort(function(a, b) {
            return compareInverted(a.name.toLowerCase(), b.name.toLowerCase());
        });
    } else if (_lastsort == "offlinecustomersortoffline") {
        _customerOfflineList.sort(function(a, b) {
            return compare(a.offline, b.offline);
        });
    } else if (_lastsort == "offlinecustomersortofflineInverted") {
        _customerOfflineList.sort(function(a, b) {
            return compareInverted(a.offline, b.offline);
        });
    } else if (_lastsort == "offlinecustomersortalloffline") {
        _customerOfflineList.sort(function(a, b) {
            return compare(a.countAll, b.countAll);
        });
    } else if (_lastsort == "offlinecustomersortallofflineInverted") {
        _customerOfflineList.sort(function(a, b) {
            return compareInverted(a.countAll, b.countAll);
        });
    } else if (_lastsort == "sorttestsystem") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return compare(a.testing, b.testing);
        });
    } else if (_lastsort == "sorttestsystemInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return compareInverted(a.testing, b.testing);
        });
    }
}

// Called from menu
function getParamsForEmail() {
    return "sort=" + _lastsort + "%26filter=" + $('#searchfield').val();
    
}

function screenshotLoader() {
	$('#pageloader').show();
	_imagesLoaded.started = 0;
	_imagesLoaded.finished = 0;
    let name;
    _imagesLoaded.systemsToCheck = [];
    for (let check of _commonChecks[_type].systems) {
        addressComplete = check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber + ", " + check.deployment.address.zipCode + " " + check.deployment.address.city :'Nicht angegeben';
        if (_customer == null || _customer == check.deployment.customer.id) {
            name = check.deployment.customer.hasOwnProperty("company") && check.deployment.customer.company.hasOwnProperty("name") ?check.deployment.customer.company.name :"";
            if ($('#searchfield').val().length === 0 || (check.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1 || addressComplete.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.abbreviation.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || name.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1))
                _imagesLoaded.systemsToCheck.push(check);
        }
    }
	const loopLimit = _imagesLoaded.simultaneous > _imagesLoaded.systemsToCheck.length ?_imagesLoaded.systemsToCheck.length :_imagesLoaded.simultaneous;
	for (let system = 0; system < loopLimit; system++)
		loadScreenshot(system);
}

function loadScreenshot(id) {
	_imagesLoaded.started++;
	let img = new Image();
	img.style = "height: 100%; width: 100%; object-fit: contain";
	img.onload = function() {
		_imagesLoaded.finished++;
		console.log("Bild(" + _imagesLoaded.systemsToCheck[id].id + "): " + _imagesLoaded.finished + " // " + _imagesLoaded.systemsToCheck.length);
		$('.screenshot[data-id=' + _imagesLoaded.systemsToCheck[id].id + ']').html(this);
		if (_imagesLoaded.started < _imagesLoaded.systemsToCheck.length)
			loadScreenshot(_imagesLoaded.started);
		else if (_imagesLoaded.finished === _imagesLoaded.systemsToCheck.length)
			$('#pageloader').hide();
	};
	img.onerror = function(error) {
		_imagesLoaded.finished++;
		console.log("Bild-offline(" + _imagesLoaded.systemsToCheck[id].id + "): " + _imagesLoaded.finished + " // " + _imagesLoaded.systemsToCheck.length);
        $('.screenshot[data-id=' + _imagesLoaded.systemsToCheck[id].id + ']').html(":/");
		if (_imagesLoaded.started < _imagesLoaded.systemsToCheck.length)
			loadScreenshot(_imagesLoaded.started);
		else if (_imagesLoaded.finished === _imagesLoaded.systemsToCheck.length)
			$('#pageloader').hide();
	};
	img.src = 'https://sysmon.homeinfo.de/screenshot/' + _imagesLoaded.systemsToCheck[id].id + '?' + _imagesLoaded.systemsToCheck[id].deployment.customer.id;
}

function saveTechnicianAnnotation(id, annotation) {
    $("#pageloader").show();
    localStorage.removeItem("servicetool.systems");
    return $.ajax({
        url: 'https://backend.homeinfo.de/deployments/' + id + "/annotation",
        method: 'PATCH',
        contentType: 'application/json',
        data: JSON.stringify(annotation),
        dataType: 'json',
		error: function (msg) {
			console.log(msg)
		},
        xhrFields: {
            withCredentials: true
        }
    });
}