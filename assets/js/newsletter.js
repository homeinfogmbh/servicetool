const _MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
var _newsletter = null;
$(document).ready(function() {
    getNewsletter().then(setNewsletter);
    $('.btn_addnewsletter').click(function(e) {
        let date = new Date(_newsletter[0].period);
        date.setMonth(date.getMonth()+1);
        let period = date.getFullYear() + "-" + (date.getMonth()+1 < 10 ?"0" + (date.getMonth()+1) :date.getMonth()+1) + "-01";
        _newsletter.unshift({"id":-1, "subject":"", "text":"", "visible":false, "period":period});
        saveNewsletter(_newsletter[0].id, _newsletter[0].subject, _newsletter[0].text, _newsletter[0].visible, _newsletter[0].period).then((data) => {
            if (_newsletter[0].id == -1)
                _newsletter[0].id = data.id;
            setNewsletter();
        });
        //$(".btn_newsletter").eq(0).click();
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
        newsletterDOM += '<tr>' +
            '<td>' +
                _MONTHS[date.getMonth()] + ' (' + date.getFullYear() + ') ' + (newsletter.default ?'<span class="whiteMark">DEFAULT</span>' :"") + '<br>' +
                '<span id="newslettersubject" style="font-size:30px;"><b>' + newsletter.subject + '</span></b>' +
                '<div id="subjectfield" style="display:none">' +
                    '<div class="dualinp inpCol">' +
                        '<input id="subjectInput" type="text" class="longInp basic-data" value="' + newsletter.subject + '">' +
                    '</div>' +
                '</div>' +

                //'<span id="newslettertext">' + newsletter.text.replaceAll("&lt;","<").replaceAll("&gt;",">") + '</span>' +
                '<div id="newslettertextfield" style="display:none">' +
                    '<div class="dualinp inpCol">' +
                        '<textarea id="newsletterTextInput" class="longInp basic-data" style=resize:auto;">' + newsletter.text.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("<br>","\n") + '</textarea>' +
                    '</div>' +
                '</div>' +
                '<div id="newslettersaveclose" style="display:none">' +
                    '<span class="whiteMark btn_saveNewsletter pointer" style="margin:0 20px 0 0" data-period="' + newsletter.period + '" data-id="' + newslettercounter + '">Speichern</span>' +
                    '<span class="whiteMark btn_newsletter pointer">Abbrechen</span>' +
                '</div><br>' +
            '</td>' +
            '<td style="min-width:250px; text-align:right; vertical-align: top;">' +
                '<span class="whiteMark btn_testNewsletter pointer" title="Verschickt eine E-Mail an diesen Account">Testmailing</span>' +
                '<a href="#" class="editIcon btn_newsletter" style="padding:0 20px 0 20px" title="Newsletter bearbeiten"><img src="assets/img/edit.svg"></a>' +
                '<input type="checkbox" style="display:none;" name="newslettervisible" id="newslettervisible' + newslettercounter + '" ' + (newsletter.visible ?"checked" :"") + '>' +
                '<label for="newslettervisible' + newslettercounter + '"><span class="btn_visible checkboxStyle orangeCheckbox" data-id="' + newslettercounter + '"></span></label>' +
            '</td>' +
        '</tr>';
        newslettercounter++;
    }
    $('#newsletterdata').html(newsletterDOM);

    $('.btn_testNewsletter').click(function(e) {
        Swal.fire({
			title: "Newsletter",
			text: "Wurde NOCH NICHT verschickt",
			showCancelButton: false,
			confirmButtonColor: '#ff821d',
			iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
			confirmButtonText: 'O.K.',
			buttonsStyling: true
		});
	});    
    
    $('.btn_newsletter').click(function(e) {
        if ($(this).parent().parent().find("#subjectfield").is(":visible")) {
            $(this).parent().parent().find("#newslettervisibleselect").hide();
            $(this).parent().parent().find("#subjectfield").hide();
            $(this).parent().parent().find("#newslettertextfield").hide();
            $(this).parent().parent().find("#newslettersaveclose").hide();
            $(this).parent().parent().find("#newslettersubject").show();
            //$(this).parent().parent().find("#newslettertext").show();
        } else {
            $(this).parent().parent().find("#newslettersubject").hide();
            //$(this).parent().parent().find("#newslettertext").hide();
            $(this).parent().parent().find("#newslettervisibleselect").show();
            $(this).parent().parent().find("#subjectfield").show();
            $(this).parent().parent().find("#newslettertextfield").show();
            $(this).parent().parent().find("#newslettersaveclose").show();
        }
		e.preventDefault();
	});

    $('.btn_visible').click(function(e) {
        _newsletter[$(this).data("id")].visible = !_newsletter[$(this).data("id")].visible;
        saveNewsletter(_newsletter[$(this).data("id")].id, _newsletter[$(this).data("id")].subject, _newsletter[$(this).data("id")].text, _newsletter[$(this).data("id")].visible, _newsletter[$(this).data("id")].period).then((data) => {
            $("#pageloader").hide();
        });
	});

    $('.btn_saveNewsletter').click(function(e) {
        let id = _newsletter[$(this).data("id")].id;
        let subject = $(this).parent().parent().find('#subjectInput').val();
        let text = $(this).parent().parent().find('#newsletterTextInput').val().replace(/\n/g, "<br>");
        let visible = $(this).parent().parent().find('#visible :selected').val() == "true";
        let period = $(this).data("period");
        _newsletter[$(this).data("id")].subject = subject;
        _newsletter[$(this).data("id")].text = text;
        _newsletter[$(this).data("id")].visible = visible;
        _newsletter[$(this).data("id")].period = period;
        saveNewsletter(id, subject, text, visible, period).then((data) => {
            setNewsletter();
        });
		e.preventDefault();
	});
    $(".btn_addnewsletter").show();
    $("#pageloader").hide();
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
    $("#pageloader").show();
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

function getCustomers() {
    return Promise.resolve(getSystems());
    return $.ajax({
        url: "https://his.homeinfo.de/customer",
        type: "GET",
    });
}