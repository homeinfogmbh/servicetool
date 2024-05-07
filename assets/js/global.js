$(document).ready(function() {
    $("#baseurl").text(_DDBOSURL);
    
    getCustomers().then((customers) => {
        setCustomers(customers);
    });
    getSystems().then((systems) => {
        setOverwriteList(systems);
        setButtons(systems);
    });
});

function setCustomers(customers) {
    let customersDOM = "";
    for (let customer of customers) {
        customersDOM += '<tr>' +
            '<td>' + customer.id + '</td>' +
            '<td>' +  customer.abbreviation + '</td>' +
            '<td>' + customer.company.name + '</td>' +
            '<td>' + (customer.hasOwnProperty("annotation") ?customer.annotation :"") + '</td>' +
        '</tr>';
    }
    $("#customerlist").html(customersDOM);
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
        url: ' https://sysmon.homeinfo.de/customer_add',
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: 'json'
    });
}