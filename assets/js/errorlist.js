var _type;
var _customer;
var _applicationVersion = null;
var _lastsort = null;
var _operatingSystemsShorts = {"Arch Linux":"Arch", "Windows XP Embedded":"XPe", "Windows XP":"XP", "Windows 8":"Win8", "Windows 7 Embedded":"Win7e", "Windows 7":"Win7", "Windows 10":"Win10"};
$(document).ready(function() {
    _type = _commonChecks.hasOwnProperty(getURLParameterByName('type')) ?getURLParameterByName('type') :'system';
    _customer = getURLParameterByName('customer');
    Promise.all(getListOfSystemChecks()).then((data)=>{
        _applicationVersion = data[1];
        setCheckList(data[0], data[1], data[2]);
        if (_customer === null) {
            setList();
        } else {
            getSystems().then((systems) => {
                let found;
                for (let system of systems) {
                    if (system.hasOwnProperty("deployment")) {
                        found = false;
                        for (let checkedSystem of _commonChecks.system.systems) {
                            if (system.id === checkedSystem.id) {
                                found = true;
                                break;
                            }
                        }
                        if (!found)
                            _commonChecks.system.systems.push(system);
                    }
                }
                setList();
            });
        }
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
                addressComplete = check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber + ", " + check.deployment.address.zipCode + " " + check.deployment.address.city :'Nicht angegeben';
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
    for (let check of _commonChecks[_type].systems) {
        addressComplete = check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber + ", " + check.deployment.address.zipCode + " " + check.deployment.address.city :'Nicht angegeben';
        if (_customer == null || _customer == check.deployment.customer.id) {
            name = check.deployment.customer.hasOwnProperty("company") && check.deployment.customer.company.hasOwnProperty("name") ?check.deployment.customer.company.name :"";
            if ($('#searchfield').val().length === 0 || (check.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1 || addressComplete.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.abbreviation.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || name.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1)) {
                address = check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber :'';
                abbreviation = check.deployment.customer.abbreviation === "Zuordnung nicht vorhanden" ?'<i>' + check.deployment.customer.abbreviation + '</i>' :check.deployment.customer.abbreviation;
                systemlistDOM += '<tr class="system" data-id="' + check.id + '">' +
                    '<td>' + check.id + '</td>' +
                    '<td>' + abbreviation + '</td>' +
                    '<td title="' + addressComplete + '" style="white-space: nowrap;">' + address +  '</td>' + //'<td title="' + address + '">' + address.substring(0, 12) + (address != '' ?'...' :'') +  '</td>' +
                    '<td><span class="' + (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && !check.checkResults[0].online /*check.checkResults[0].sshLogin === "failed" && !check.checkResults[0].icmpRequest*/ /*&& check.fitted && !check.deployment.testing*/ ?'orangeCircle' :'blueCircle') + '"></span></td>' +
                    '<td><span class="' + (!check.fitted ?'orangeCircle' :'blueCircle') + '"></span></td>' +
                    '<td><span class="' + (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].smartCheck === "failed" ?'orangeCircle' :'blueCircle') + '"></span></td>' +
                    '<td><span class="' + (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].sshLogin === "failed" ?"orangeCircle":"blueCircle") + '"></span></td>' +
                    '<td><span class="' + (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && (check.checkResults[0].applicationState === "conflict" || check.checkResults[0].applicationState === "not enabled" || check.checkResults[0].applicationState === "not running") ?"orangeCircle":"blueCircle") + '"></span></td>' +
                    '<td><span class="' + (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("applicationVersion") && _applicationVersion === check.checkResults[0].applicationVersion ?"blueCircle":"orangeCircle") + '"></span></td>' +
                    '<td>' + (check.hasOwnProperty("lastSync") ?formatDate(check.lastSync) + " (" + check.lastSync.substring(11, 16) + "h)": "noch nie") + '</td>' +
                    '<td><span class="whiteMark" style="min-width:auto; display:block">' + (_operatingSystemsShorts.hasOwnProperty(check.operatingSystem) ?_operatingSystemsShorts[check.operatingSystem] :check.operatingSystem) + '</span></td>' +
                    '<td><a href="display-details.html?id=' + check.id + '" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>' +
                '</tr>';
                counter++;
            }
        }
    }
    systemlistDOM = systemlistDOM === "" ?"<tr><td>Keine Einträge vorhanden</td></tr>" :systemlistDOM;
    $("#systemlist").html(systemlistDOM);
    $(".dashTopLeft").html('<h2>' + (_customer == null?_commonChecks[_type].title :'Displays für ' + abbreviation) + ' (' + counter + ')</h2><p>' + (_customer == null ?_commonChecks[_type].text :'Liste aller Displays für ' +  name + ' (' + _customer + ')') + '</p>');
    $("#pageloader").hide();
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
            return compare(a.deployment.address.street.toLowerCase(), b.deployment.address.street.toLowerCase());
        });
    } else if (_lastsort == "sortaddressInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return compareInverted(a.deployment.address.street.toLowerCase(), b.deployment.address.street.toLowerCase());
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
    } else if (_lastsort == "sortssh") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return a.hasOwnProperty("checkResults") && a.checkResults[0].sshLogin === "failed" ?-1 :b.hasOwnProperty("checkResults") && b.checkResults[0].sshLogin === "failed" ?1 :0
        });
    } else if (_lastsort == "sortsshInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return b.hasOwnProperty("checkResults") && b.checkResults[0].sshLogin === "failed" ?-1 :a.hasOwnProperty("checkResults") && a.checkResults[0].sshLogin === "failed" ?1 :0
        });
    } else if (_lastsort == "sortapprunning") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return a.hasOwnProperty("checkResults") && a.checkResults[0].applicationState === "not running" ?-1 :b.hasOwnProperty("checkResults") && b.checkResults[0].applicationState === "not running" ?1 :0
        });
    } else if (_lastsort == "sortapprunningInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return b.hasOwnProperty("checkResults") && b.checkResults[0].applicationState === "not running" ?-1 :a.hasOwnProperty("checkResults") && a.checkResults[0].applicationState === "not running" ?1 :0
        });
    } else if (_lastsort == "sortappuptodate") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return isOnDate(b.lastSync, 24) ?-1 :isOnDate(a.lastSync, 24) ?1 :0
        });
    } else if (_lastsort == "sortappuptodateInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return isOnDate(a.lastSync, 24) ?-1 :isOnDate(b.lastSync, 24) ?1 :0
        });
    } else if (_lastsort == "sortsync") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return !b.hasOwnProperty("lastSync") ?-1 :!a.hasOwnProperty("lastSync") ?1 :compareInverted(a.lastSync.toLowerCase(), b.lastSync.toLowerCase());            
        });
    } else if (_lastsort == "sortsyncInverted") {
        _commonChecks[_type].systems.sort(function(a, b) {
            return !a.hasOwnProperty("lastSync") ?-1 :!b.hasOwnProperty("lastSync") ?1 :compare(a.lastSync.toLowerCase(), b.lastSync.toLowerCase());            
        });
    }
}

// Called from menu
function getParamsForEmail() {
    return "sort=" + _lastsort + "%26filter=" + $('#searchfield').val();
    
}