
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
                let emailsEnterd = '';
                for (let email of customeremails[customer]) {
                    if (emailsEnterd != '')
                        emailsEnterd += ', ';
                    emailsEnterd += email.email;
                }
                emailsDOM += '<tr>' +
                    '<td>' + customers[customer].abbreviation + '</td>' +
                    '<td>' + 
                        '<span class="btn_customeremails">' + (emailsEnterd == "" ?"-" :emailsEnterd) + '</span>' +
                        '<div id="customeremailsfield" style="display:none; padding-top:5px">' +
                            '<div class="dualinp inpCol">' +
                                '<input id="customeremailsInput" type="text" class="longInp basic-data" value="' + emailsEnterd + '">' +
                            '</div>' +
                            '<div style="float:right">' +
                                '<span class="whiteMark btn_save_emails pointer" data-customer="' + customers[customer].id + '">Speichern</span>' +
                                '<span class="whiteMark btn_closeCustomerEmails pointer">Abbrechen</span>' +
                            '</div>' +
                        '</div>' +
                        //'<td>' + emailsEnterd + '</td>' +
                    '</td>';
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
        if ($(this).parent().find("#customeremailsfield").is(":visible"))
            $(this).parent().find("#customeremailsfield").hide();
        else
            $(this).parent().find("#customeremailsfield").show();
        $(this).parent().find('#customeremailsInput').focus();
        e.preventDefault();
    });
    $('.btn_closeCustomerEmails').click(function(e) {
        $(this).parent().parent().parent().find('.btn_customeremails').click();
        e.preventDefault();
    });
    $('.btn_save_emails').click(function(e) {
            let emails = [];
            let emailsEntered = $(this).parent().parent().find('#customeremailsInput').val().replace(/\s+/, "").replaceAll(/;+/g,',').replaceAll(/,+/g,',').split(',');
            if (emailsEntered != '') {
                for (let email of emailsEntered)
                    emails.push({'email':email.trim()});
            }
            saveCustomerEmails($(this).data('customer'), emails).then(() => {
                $(this).parent().parent().parent().find('.btn_customeremails').text((emailsEnterd == "" ?"-" :emailsEnterd));
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