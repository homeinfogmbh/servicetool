
$(document).ready(function() {
    getCustomers().then((customers) => {
        customers.sort(function(a, b) {
            return compareStrings(a.company.name, b.company.name);
        });
        let promises = [];
        for (let customer of customers)
            promises.push(getEmails(customer.id));
        Promise.all(promises).then((customeremails) => {
            let emailsDOM = "";
            for (let customer in customeremails) {
                let emailsEntered = '';
                let emailsEnteredLines = '';
                for (let email of customeremails[customer]) {
                    if (emailsEntered != '')
                        emailsEntered += ', ';
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
                            '<div style="float:right">' +
                                '<span class="whiteMark btn_save_emails pointer" data-customer="' + customers[customer].id + '">Speichern</span>' +
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
    })
    
});
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

function getCustomers() {
    return $.ajax({
        url: "https://his.homeinfo.de/customer",
        type: "GET",
    });
}

function getEmails(customerid) {
	return $.ajax({
		url: "https://sysmon.homeinfo.de/user-notification-emails?customer=" + customerid,
		type: "GET",
		success: function (emails) { },
		error: function (msg) {
			setErrorMessage(msg, "Laden der E-Mails");
		}
	});	
}

function compareStrings(a, b) {
	return (a < b) ? -1 : (a > b) ? 1 : 0;
}