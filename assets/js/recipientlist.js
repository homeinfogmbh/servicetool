var _customerEmails = {};
$(document).ready(function() {
    getExtraUserEmails().then(setExtraUserEmails);
    getCustomers().then(setEmails);
});

function setExtraUserEmails(useremails) {
    let emailsDOM = "";
    let emails2c = "";
    let emails = "";
    for (let email of useremails) {
        emails2c += email.email + "<br>";
        emails += email.email + "\n";
    }
    emailsDOM += '<tr>' +
        '<td>' + 
            '<span id="extrauseremailsEnteredLines">' + (emails2c == "" ?"-" :emails2c) + '</span>' +
            '<div id="extrauseremailsfield" style="display:none; padding-top:5px">' +
                '<div class="dualinp inpCol">' +
                    '<textarea id="extrausermails" class="longInp basic-data" style=resize:auto;">' + emails + '</textarea>' +
                '</div>' +
                '<div>' +
                    '<span class="whiteMark btn_save_extrauseremails pointer" style="margin:0 20px 0 0; opacity:0.3"  title="Es werden noch Daten geladen">Speichern</span>' +
                    '<span class="whiteMark btn_closeExtraUserEmails pointer">Abbrechen</span>' +
                '</div>' +
            '</div>' +
        '</td>' +
        '<td style="min-width:50px">' +
            '<a href="#" class="editIcon btn_extrauseremails"><img src="assets/img/edit.svg" alt=""></a>' +
        '</td>' +
    '</tr>';
    $('#extraUserEmails').html(emailsDOM);

    $('.btn_extrauseremails').click(function(e) {
        if ($("#extrauseremailsfield").is(":visible"))
            $("#extrauseremailsfield").hide();
        else
            $("#extrauseremailsfield").show();
        $('#extrausermails').focus();
        e.preventDefault();
    });
    $('.btn_closeExtraUserEmails').click(function(e) {
        $('.btn_extrauseremails').click();
        e.preventDefault();
    });
}
function setEmails(customers) {
    let customerList = {};
    for (let system of customers) {
        if (system.hasOwnProperty("deployment")) {
            if (!customerList.hasOwnProperty(system.deployment.customer.id))
                customerList[system.deployment.customer.id] = system.deployment.customer;
        }
    }
    customers = [];
    for (let customer in customerList)
        customers.push(customerList[customer]);
    customers.sort(function(a, b) {
        return compareStrings(a.company.name, b.company.name);
    });
    let promises = [];
    for (let customer of customers)
        promises.push(getEmails(customer.id));
    Promise.all(promises).then((customeremails) => {
        let emailsDOM = "";
        let emailsEntered;
        let emailsEnteredLines;
        for (let customer in customeremails) {
            emailsEntered = '';
            emailsEnteredLines = '';
            for (let email of customeremails[customer]) {
                if (emailsEntered != '')
                    emailsEntered += ', ';
                _customerEmails[email.email] = true;
                emailsEntered += email.email;
                emailsEnteredLines += email.email + '<br>';
            }
            emailsDOM += '<tr>' +
                '<td>' + customers[customer].abbreviation + '</td>' +
                '<td>' + 
                    '<span id="customeremailsEnteredLines">' + (emailsEnteredLines == "" ?"-" :emailsEnteredLines) + '</span>' +
                    '<div id="customeremailsfield" style="display:none; padding-top:5px">' +
                        '<div class="dualinp inpCol">' +
                            '<input id="customeremailsInput" type="text" class="longInp basic-data" value="' + emailsEntered + '">' +
                        '</div>' +
                        '<div>' +
                            '<span class="whiteMark btn_save_emails pointer" style="margin:0 20px 0 0" data-customer="' + customers[customer].id + '">Speichern</span>' +
                            '<span class="whiteMark btn_closeCustomerEmails pointer">Abbrechen</span>' +
                        '</div>' +
                    '</div>' +
                '</td>' +
                '<td style="min-width:50px">' +
                    '<a href="#" class="editIcon btn_customeremails"><img src="assets/img/edit.svg" alt=""></a>' +
                '</td>' +
                '<td style="min-width:50px">' +
                    '<a href="https://typo3.homeinfo.de/ddb-report?customer=' + customers[customer].id + '" target="_blank"><img src="assets/img/eye.svg" alt="huntinglink"></a>' +
                '</td>' +
            '</tr>';
        }
        $('#customerEmails').html(emailsDOM);
        setButtons();
        $("#pageloader").hide();
    });
}

function setButtons() {
    $('.btn_customeremails').click(function(e) {
        if ($(this).parent().parent().find("#customeremailsfield").is(":visible"))
            $(this).parent().parent().find("#customeremailsfield").hide();
        else
            $(this).parent().parent().find("#customeremailsfield").show();
        $(this).parent().parent().find('#customeremailsInput').focus();
        e.preventDefault();
    });
    $('.btn_closeCustomerEmails').click(function(e) {
        $(this).parent().parent().parent().parent().find('.btn_customeremails').click();
        e.preventDefault();
    });
    $('.btn_save_emails').click(function(e) {
            let emails = [];
            let emailsEntered = $(this).parent().parent().parent().find('#customeremailsInput').val().replace(/\s+/, "").replaceAll(/;+/g,',').replaceAll(/,+/g,',').split(',');
            let emailsEnteredLines = '';
            if (emailsEntered != '') {
                for (let email of emailsEntered) {
                    emails.push({'email':email.trim()});
                    emailsEnteredLines += email + '<br>';
                }
            }
            saveCustomerEmails($(this).data('customer'), emails).then(() => {
                $(this).parent().parent().parent().find('#customeremailsEnteredLines').html((emailsEnteredLines == "" ?"-" :emailsEnteredLines));
                $(this).parent().parent().parent().find("#customeremailsfield").hide();
                $("#pageloader").hide()
            });
        e.preventDefault();
    });
    $(".btn_save_extrauseremails").css("title", "Eintrag bearbeiten");
    $(".btn_save_extrauseremails").css("opacity", "1");
    $('.btn_save_extrauseremails').click(function(e) {
        let emails = [];
        let emailsEntered = $('#extrausermails').val().replaceAll(/;+/g,'').replaceAll(/,+/g,'').split('\n');
        let emailsEnteredLines = '';
        let deletedEmails = "";
        if (emailsEntered != '') {
            for (let email of emailsEntered) {
                if (email != "") {
                    if (_customerEmails.hasOwnProperty(email)) {
                        deletedEmails += email + ', '
                    } else {
                        emailsEnteredLines += email + '<br>';
                        emails.push({'email':email.trim()});
                    }
                }
            }
        }
        saveExtraUserEmails(emails).then(() => {
            if (deletedEmails != "") {
                Swal.fire({
                    title: "Gelöschte E-Mails",
                    text: deletedEmails,
                    showCancelButton: false,
                    confirmButtonColor: '#ff821d',
                    iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                    confirmButtonText: 'O.K.',
                    buttonsStyling: true
                });
            }
            $('#extrauseremailsEnteredLines').html((emailsEnteredLines == "" ?"-" :emailsEnteredLines));
            $("#extrauseremailsfield").hide();
            $("#pageloader").hide()
        });
    e.preventDefault();
});

}

function saveCustomerEmails(customer, emails) {
    $("#pageloader").show();
    return $.ajax({
        url: "https://sysmon.homeinfo.de/user-notification-emails?customer=" + customer,
        type: "POST",
        data: JSON.stringify(emails),
        contentType: 'application/json',
        error: function (msg) {
            setErrorMessage(msg, "Speichern der E-Mails");
        }
    });	
}
function saveExtraUserEmails(emails) {
    $("#pageloader").show();
    return $.ajax({
        url: "https://sysmon.homeinfo.de/extra-user-notification-emails",
        type: "POST",
        data: JSON.stringify(emails),
        contentType: 'application/json',
        error: function (msg) {
            setErrorMessage(msg, "Speichern der E-Mails");
        }
    });	
}

function getCustomers() {
    return Promise.resolve(getSystems());
    return $.ajax({
        url: "https://his.homeinfo.de/customer",
        type: "GET",
    });
}


function getEmails(customerid) {
	return $.ajax({
		url: "https://sysmon.homeinfo.de/user-notification-emails?customer=" + customerid,
		type: "GET",
		error: function (msg) {
			setErrorMessage(msg, "Laden der E-Mails");
		}
	});	
}
function getExtraUserEmails() {
	return $.ajax({
		url: "https://sysmon.homeinfo.de/extra-user-notification-emails",
		type: "GET",
		error: function (msg) {
			setErrorMessage(msg, "Laden der E-Mails");
		}
	});	
}

function compareStrings(a, b) {
	return (a < b) ? -1 : (a > b) ? 1 : 0;
}