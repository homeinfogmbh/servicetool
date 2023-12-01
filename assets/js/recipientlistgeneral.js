var _customerEmails = {};
$(document).ready(function() {
    getExtraUserEmails().then(setExtraUserEmails);
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
    setButtons();
    $("#pageloader").hide();
}

function setButtons() {
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
                        deletedEmails += email.toLowerCase() + ', '
                    } else {
                        emailsEnteredLines += email.toLowerCase() + '<br>';
                        emails.push({'email':email.toLowerCase().trim()});
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