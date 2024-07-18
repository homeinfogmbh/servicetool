var _customerGlobalList = null;
var _lastsortcustomer = null;
$(document).ready(function() {
    $("#baseurl").text(_DDBOSURL);
    
    getWarningmail().then((settings) => {
        setWarningmail(settings);
    });

    getCustomers().then((customers) => {
        setCustomers(customers);
    });
    getSystems().then((systems) => {
        setOverwriteList(systems);
        setButtons(systems);
    });
    $('.sortCustomer').click(function(e) {
        setCustomers(null, $(this).data("id"));
		e.preventDefault();
	}); 
    $('#submitWarningmail').click(function(e) {
        if ($('#warningSubject').val().trim() == "")
            $('#warningSubject').css({"outline": "5px solid red"});
        else
            $('#warningSubject').css({"outline": "unset"});
        if ($('#warningtext').val().trim() == "")
            $('#warningtext').css({"outline": "5px solid red"});
        else
            $('#warningtext').css({"outline": "unset"});
        if ($('#minsystems').val().trim() == "")
            $('#minsystems').css({"outline": "5px solid red"});
        else
            $('#minsystems').css({"outline": "unset"});
        if ($('#minpercent').val().trim() == "")
            $('#minpercent').css({"outline": "5px solid red"});
        else
            $('#minpercent').css({"outline": "unset"});

        if ($('#warningSubject').val().trim() != "" && $('#warningtext').val().trim() != "" && $('#minsystems').val().trim() != "" && $('#minpercent').val().trim() != "") {
            updateWarningmail(1, $('#warningSubject').val(), $('#warningtext').val(), $('#minsystems').val(), $('#minpercent').val()).then((data) => {
                $("#pageloader").hide();
            });
        }
		e.preventDefault();
	}); 
});

function setWarningmail(settings) {
    $('#minsystems').val(settings.minsystems);
    $('#minpercent').val(settings.minpercent);
    $('#warningtext').val(settings.text);
    $('#warningSubject').val(settings.subject);
}
function setCustomers(customers, sort = "customerabbreviation") {
    if (_customerGlobalList == null && customers != null)
        _customerGlobalList = customers;
    sortCustomerList(sort);
    let customersDOM = "";
    for (let customer of _customerGlobalList) {
        customersDOM += '<tr>' +
            '<td>' + customer.id + '</td>' +
            '<td>' +  customer.abbreviation + '</td>' +
            '<td>' + customer.company.name + '</td>' +
            '<td>' + (customer.hasOwnProperty("annotation") ?customer.annotation :"") + '</td>' +
            '<td><img class="btn_copyURL pointer" src="assets/img/copy.png" data-url="' + getDefaultCustomerBaseURL(customer.abbreviation) + '"></td>' +
        '</tr>';
    }
    $("#customerlist").html(customersDOM);
    $('.btn_copyURL').click(function(e) {
        navigator.clipboard.writeText($(this).data("url"));
		e.preventDefault();
	});
}

function setOverwriteList(systems) {
    let overwriteDOM = "";
    for (let system of systems) {
        if (system.ddbOs && system.hasOwnProperty("deployment") && system.deployment.hasOwnProperty("url") && getDefaultDisplayURL(system) != system.deployment.url.split("&amp;").join("&")) {
            let address =  system.deployment.hasOwnProperty("address") ?system.deployment.address.street + " " + system.deployment.address.houseNumber + ", " + system.deployment.address.zipCode + " " + system.deployment.address.city :'<i>Keine Adresse angegeben</i>';
            overwriteDOM += '<tr>' +
                '<td>' + system.deployment.customer.abbreviation + '</td>' +
                '<td title="' + address + '">' + system.deployment.address.street + " " + system.deployment.address.houseNumber +  '</td>' +
                '<td style="word-break: break-all;">' + system.deployment.url + '</span></td>' +
                '<td><a href="display-details.html?id=' + system.id + '" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>' +
            '</tr>';
        }
    }
    //let url = new URL('https://stackoverflow.com/questions/1420881');
    //alert(url.origin);
    $("#overwritelist").html(overwriteDOM);
}
function setButtons(systems) {
    $(".btn_baseurl").attr("title", 'Ändern der Base URL');
    $('.btn_baseurl').click(function(e) {
        $("#baseurlInput").val($("#baseurl").text() === "-" ?"" :$("#baseurl").text());
        if ($("#baseurlfields").is(":visible"))
            $("#baseurlfields").hide();
        else
            $("#baseurlfields").show();
        $("#baseurlInput").focus();
        e.preventDefault();
    });
    $('.btn_savebaseurl').click(function(e) {
        _DDBOSURL = $("#baseurlInput").val();
        $("#baseurl").text(_DDBOSURL);
        $("#baseurlfields").hide();
        e.preventDefault();
    });

    $('.btn_displayurlDefault').click(function(e) {
        Swal.fire({
            title: 'Sind Sie sicher?',
            text: 'Wollen Sie die Display-URLs aller nicht gelisteten Systeme mit der Base URL "' + _DDBOSURL + '" neu einstellen? Die Applikation wird daraufhin versucht neu zu starten.',
            showCancelButton: true,
            confirmButtonColor: '#009fe3',
            cancelButtonColor: '#ff821d',
            iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
            confirmButtonText: 'Ja, neu einstellen!',
            cancelButtonText: 'Vorgang abbrechen!',
            buttonsStyling: true
        }).then(function(selection) {
            if (selection.isConfirmed === true)
                setDefaults(systems).then((data)=> {
                    $("#pageloader").hide();
                }, (error)=>{
                    $("#pageloader").hide();
                });
        })
        e.preventDefault();
    });

    $('#submit').click(function(e) {
        if ($("#customername").val() == "")
            $('#customername').css({"outline": "5px solid red"});
        else
            $('#customername').css({"outline": "unset"});
        if ($("#abbreviation").val() == "")
            $('#abbreviation').css({"outline": "5px solid red"});
        else
            $('#abbreviation').css({"outline": "unset"});
        if ($("#customernumber").val() == "")
            $('#customernumber').css({"outline": "5px solid red"});
        else
            $('#customernumber').css({"outline": "unset"});


        if ($("#customername").val() != "" && $('#abbreviation').val() != "" && $('#customernumber').val() != "") {
            saveNewCustomer($("#customername").val(), $("#annotation").val(), $("#abbreviation").val(), $("#customernumber").val()).then(()=>{
                getCustomers().then((customers) => {
                    setCustomers(customers);
                    $("#pageloader").hide();
                });
            }, (error) => {
                let text = "Es ist ein Fehler aufgetreten: " + error.responseText;
                if (error.responseText.indexOf("Duplicate entry") != -1)
                    text = "Diese Kundennummer gibt es schon."
                Swal.fire({
                    title: 'Das hat nicht geklappt',
                    text: text,
                })
            });
        }
        e.preventDefault();
    });
    
    $("#pageloader").hide();
}


function setDefaults(systems) {
    $("#pageloader").show();
    localStorage.removeItem("servicetool.systems");
    //localStorage.removeItem("servicetool.systemchecks");
    let promises = [];
    for (let system of systems) {
        if (system.ddbOs && system.hasOwnProperty("deployment") && system.deployment.url.indexOf("overwrite=true") == -1) {
            console.log(system.id);
            promises.push(changedisplayurl(getDefaultDisplayURL(system), system));
        }
    }
    return Promise.all(promises);
}

function changedisplayurl(displayurl, system) {
	let data = {"url":displayurl};
	return $.ajax({
		url: "https://termgr.homeinfo.de/administer/url/" + system.deployment.id,
		type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json'
	});   
}

function getCustomers() {
	return $.ajax({
		url: "https://his.homeinfo.de/customer",
		type: "GET",
	});   
}

function saveNewCustomer(name, annotation, abbreviation, id) {
    $("#pageloader").show();
    let data = {
        company: {"name": name},
        customer: {"annotation": annotation, "abbreviation": abbreviation, "id":id},	
    };
    return $.ajax({
        type: 'POST',
        url: 'https://sysmon.homeinfo.de/customer_add',
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: 'json'
    });
}

function getWarningmail() {
	return $.ajax({
		url: 'https://sysmon.homeinfo.de/warningmail',
		type: 'GET',
	});   
}
function updateWarningmail(id, subject, text, minsystems = 6, minpercent = 20) {
    $("#pageloader").show();
    let data = {
        'subject': subject,
        'text': text,
        'minsystems': minsystems,
        'minpercent': minpercent
    };
    return $.ajax({
        type: 'POST',
        url: 'https://sysmon.homeinfo.de/patch_warningmail/' + id,
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: 'json'
    });
}

function sortCustomerList(sort) {
        _lastsortcustomer = _lastsortcustomer === sort && _lastsortcustomer.indexOf('inverted' === -1) ? _lastsortcustomer + "Inverted" :sort;
    if (_lastsortcustomer == "customerid") {
        _customerGlobalList.sort(function(a, b) {
            return compare(a.id, b.id);
        });
    } else if (_lastsortcustomer == "customeridInverted") {
        _customerGlobalList.sort(function(a, b) {
            return compareInverted(a.id, b.id);
        });
    } else if (_lastsortcustomer == "customerabbreviation") {
        _customerGlobalList.sort(function(a, b) {
            if (!a.hasOwnProperty("abbreviation") || !b.hasOwnProperty("abbreviation"))
                return 0;
            return compare(a.abbreviation.toLowerCase(), b.abbreviation.toLowerCase());
        });
    } else if (_lastsortcustomer == "customerabbreviationInverted") {
        _customerGlobalList.sort(function(a, b) {
            if (!a.hasOwnProperty("abbreviation") || !b.hasOwnProperty("abbreviation"))
                return 0;
            return compareInverted(a.abbreviation.toLowerCase(), b.abbreviation.toLowerCase());
        });
    } else if (_lastsortcustomer == "customer") {
        _customerGlobalList.sort(function(a, b) {
            return compare(a.company.name.toLowerCase(), b.company.name.toLowerCase());
        });
    } else if (_lastsortcustomer == "customerInverted") {
        _customerGlobalList.sort(function(a, b) {
            return compareInverted(a.company.name.toLowerCase(), b.company.name.toLowerCase());
        });
    } else if (_lastsortcustomer == "customerannotation") {
        _customerGlobalList.sort(function(a, b) {
            if (!a.hasOwnProperty("annotation") && !b.hasOwnProperty("annotation"))
                return 1;
            else if (a.hasOwnProperty("annotation") && !b.hasOwnProperty("annotation"))
                return -1;
            else if (!a.hasOwnProperty("annotation") && b.hasOwnProperty("annotation"))
                return 1;
            return compare(a.annotation.toLowerCase(), b.annotation.toLowerCase());
        });
    } else if (_lastsortcustomer == "customerannotationInverted") {
        _customerGlobalList.sort(function(a, b) {
            if (!a.hasOwnProperty("annotation") && !b.hasOwnProperty("annotation"))
                return -1;
            else if (a.hasOwnProperty("annotation") && !b.hasOwnProperty("annotation"))
                return 1;
            else if (!a.hasOwnProperty("annotation") && b.hasOwnProperty("annotation"))
                return -1;
            return compareInverted(a.annotation.toLowerCase(), b.annotation.toLowerCase());
        });
    }
}