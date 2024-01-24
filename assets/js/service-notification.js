var _customerEmails = {};
$(document).ready(function() {
    getServiceEmails().then(setServiceEmails);
});

function setServiceEmails(useremails) {
    let emailsDOM = "";
    let emails2c = "";
    let emails = "";
    for (let email of useremails) {
        emails2c += email.email + "<br>";
        emails += email.email + "\n";
    }
    emailsDOM += '<tr>' +
        '<td>' + 
            '<span id="serviceemailsEnteredLines">' + (emails2c == "" ?"-" :emails2c) + '</span>' +
            '<div id="serviceemailsfield" style="display:none; padding-top:5px">' +
                '<div class="dualinp inpCol">' +
                    '<textarea id="servicemails" class="longInp basic-data" style=resize:auto;">' + emails + '</textarea>' +
                '</div>' +
                '<div>' +
                    '<span class="whiteMark btn_save_serviceemails pointer" style="margin:0 20px 0 0; opacity:0.3"  title="Es werden noch Daten geladen">Speichern</span>' +
                    '<span class="whiteMark btn_closeserviceEmails pointer">Abbrechen</span>' +
                '</div>' +
            '</div>' +
        '</td>' +
        '<td style="min-width:50px">' +
            '<a href="#" class="editIcon btn_serviceemails"><img src="assets/img/edit.svg" alt=""></a>' +
        '</td>' +
    '</tr>';
    $('#serviceEmails').html(emailsDOM);

    $('.btn_serviceemails').click(function(e) {
        if ($("#serviceemailsfield").is(":visible"))
            $("#serviceemailsfield").hide();
        else
            $("#serviceemailsfield").show();
        $('#servicemails').focus();
        e.preventDefault();
    });
    $('.btn_closeserviceEmails').click(function(e) {
        $('.btn_serviceemails').click();
        e.preventDefault();
    });
    setButtons();
    $("#pageloader").hide();
}

function setButtons() {
    $(".btn_save_serviceemails").css("title", "Eintrag bearbeiten");
    $(".btn_save_serviceemails").css("opacity", "1");
    $('.btn_save_serviceemails').click(function(e) {
        let emails = [];
        let emailsEntered = $('#servicemails').val().replaceAll(/;+/g,'').replaceAll(/,+/g,'').split('\n');
        let emailsEnteredLines = '';
        let deletedEmails = "";
        if (emailsEntered != '') {
            for (let email of emailsEntered) {
                if (email != "") {
                    if (_customerEmails.hasOwnProperty(email)) {
                        deletedEmails += email.toLowerCase() + ', '
                    } else {
                        emailsEnteredLines += email.toLowerCase() + '<br>';
                        emails.push({'email':email.toLowerCase().trim()});
                    }
                }
            }
        }
        saveServiceEmails(emails).then(() => {
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
            $('#serviceemailsEnteredLines').html((emailsEnteredLines == "" ?"-" :emailsEnteredLines));
            $("#serviceemailsfield").hide();
            $("#pageloader").hide()
        });
    e.preventDefault();
});

}
function saveServiceEmails(emails) {
    /*
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
    */
}

function getServiceEmails() {
    /*
	return $.ajax({
		url: "https://sysmon.homeinfo.de/extra-user-notification-emails",
		type: "GET",
		error: function (msg) {
			setErrorMessage(msg, "Laden der E-Mails");
		}
	});	
    */
}

function compareStrings(a, b) {
	return (a < b) ? -1 : (a > b) ? 1 : 0;
}