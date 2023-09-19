const _MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
var _newsletter = null;
$(document).ready(function() {
    getNewsletter().then(setNewsletter);
    getCustomers().then(setEmails);
    $('.btn_addnewsletter').click(function(e) {
        let date = new Date(_newsletter[0].period);
        date.setMonth(date.getMonth()+1);
        let period = date.getFullYear() + "-" + (date.getMonth()+1 < 10 ?"0"+date.getMonth()+1 :date.getMonth()+1) + "-" + (date.getDate() < 10 ?"0"+date.getDate() :date.getDate());
        _newsletter.unshift({"id":-1, "subject":_newsletter[0].subject, "text":_newsletter[0].text, "visible":0, "period":period});
        setNewsletter();
        $(".btn_newsletter").eq(0).click();
		e.preventDefault();
	});
});

function setNewsletter(newsletters) {
    if (_newsletter === null) {
        _newsletter = newsletters.reverse();
    }
    let newsletterDOM = ""
    let date;
    let newslettercounter = 0;
    for (let newsletter of _newsletter) {
        date = new Date(newsletter.period);
        newsletterDOM += '<div class="tableBox BeobachtTable">' +
            '<h3 style="color:' + (newsletter.visible ?"" :"#ff821d") + '"><u><i>' + _MONTHS[date.getMonth()] + ' ' + date.getFullYear() + '</i></u>' +
                ' <a href="#" class="editIcon btn_newsletter" title="Newsletter bearbeiten"><img src="assets/img/edit.svg" alt=""></a>' +
            '</h3>' +
            '<div id="newslettersaveclose" style="float:right; display:none">' +
                '<span class="whiteMark btn_saveNewsletter pointer" data-period="' + newsletter.period + '" data-id="' + newslettercounter + '">Speichern</span>' +
                '<span class="whiteMark btn_newsletter pointer">Abbrechen</span>' +
            '</div>' +
            
            '<div id="newslettervisibleselect" class="select" style="display:none">' +
                '<select name="visible" id="visible" class="basic-data">' +
                    '<option value="0" ' + (newsletter.visible == 0?'selected' :'') + '>nicht aktiv</option>' +
                    '<option value="1" ' + (newsletter.visible == 1?'selected' :'') + '>aktiv</option>' +
                '</select>' +
                '<span class="selectArrow"></span>' +
            '</div><br>' +

            'Betreff: <b><span id="newslettersubject">' + newsletter.subject + '</span></b>' +
            '<div id="subjectfield" style="display:none">' +
                '<div class="dualinp inpCol">' +
                    '<input id="subjectInput" type="text" class="longInp basic-data" value="' + newsletter.subject + '">' +
                '</div>' +
            '</div><br>' +

            '<span class="newslettertextfield">' + newsletter.text.replaceAll("&lt;","<").replaceAll("&gt;",">") + '</span>' +
            '<div id="newslettertextfield" style="display:none">' +
                '<div class="dualinp inpCol">' +
                    '<textarea id="newsletterTextInput" class="longInp basic-data" style=resize:auto;">' + newsletter.text.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("<br>","\n") + '</textarea>' +
                '</div>' +
            '</div>' +
        '</div><br>';
        newslettercounter++;
    }
    $('#newsletterdata').html(newsletterDOM);

    $('.btn_newsletter').click(function(e) {
        if ($(this).parent().parent().find("#subjectfield").is(":visible")) {
            $(this).parent().parent().find("#newslettervisibleselect").hide();
            $(this).parent().parent().find("#subjectfield").hide();
            $(this).parent().parent().find("#newslettertextfield").hide();
            $(this).parent().parent().find("#newslettersaveclose").hide();
        } else {
            $(this).parent().parent().find("#newslettervisibleselect").show();
            $(this).parent().parent().find("#subjectfield").show();
            $(this).parent().parent().find("#newslettertextfield").show();
            $(this).parent().parent().find("#newslettersaveclose").show();
        }
		e.preventDefault();
	});
    $('.btn_saveNewsletter').click(function(e) {
        $("#pageloader").show();
        let id = _newsletter[$(this).data("id")].id;
        let subject = $(this).parent().parent().find('#subjectInput').val();
        let text = $(this).parent().parent().find('#newsletterTextInput').val().replace(/\n/g, "<br>");
        let visible = $(this).parent().parent().find('#visible :selected').val();
        let period = $(this).data("period");
        _newsletter[$(this).data("id")].subject = subject;
        _newsletter[$(this).data("id")].text = text;
        _newsletter[$(this).data("id")].visible = visible;
        _newsletter[$(this).data("id")].period = period;
        saveNewsletter(_newsletter[$(this).data("id")].id, subject, text, visible, period).then((data) => {
            if (id == -1)
                _newsletter[0].id = data.id;
            setNewsletter();
            $("#pageloader").hide()
        });
		e.preventDefault();
	});
    $(".btn_addnewsletter").show();
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
}

function getNewsletter() {
	return $.ajax({
		url: "https://sysmon.homeinfo.de/newsletters",
		type: "GET",
		error: function (msg) {
			setErrorMessage(msg, "Laden der Newsletter");
		}
	});	
}
function saveNewsletter(id, subject, text, visible, period) {
    let data = '{"subject":"' + subject + '","text":"' + text + '","visible":'+ visible + ', "period":"' + period + '"}';
    let url = "https://sysmon.homeinfo.de/patch_newsletter/" + id; 
    if (id == -1)
        url = "https://sysmon.homeinfo.de/add_newsletter";
	return $.ajax({
		url: url,
		type: "POST",
        data: data,
        contentType: 'application/json',
		error: function (msg) {
			setErrorMessage(msg, "Anlegen/ändern des Newsletters");
		}
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

function compareStrings(a, b) {
	return (a < b) ? -1 : (a > b) ? 1 : 0;
}