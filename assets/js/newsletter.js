const _MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
var _newsletter = null;
$(document).ready(function() {
    getNewsletter().then(setNewsletter);
    $('.btn_addnewsletter').click(function(e) {
        let date = new Date(_newsletter[0].period);
        date.setMonth(date.getMonth()+1);
        let period = date.getFullYear() + "-" + (date.getMonth()+1 < 10 ?"0"+date.getMonth()+1 :date.getMonth()+1) + "-" + (date.getDate() < 10 ?"0"+date.getDate() :date.getDate());
        _newsletter.unshift({"id":-1, "subject":"", "text":"", "visible":false, "period":period});
        setNewsletter();
        $(".btn_newsletter").eq(0).click();
		e.preventDefault();
	});
});

function setNewsletter(newsletters) {
    if (_newsletter === null) {
        _newsletter = newsletters.reverse();
    }
    console.log(_newsletter)
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
                    '<option value="false" ' + (!newsletter.visible ?'selected' :'') + '>Entwurf</option>' +
                    '<option value="true" ' + (newsletter.visible ?'selected' :'') + '>Freigeschaltet</option>' +
                '</select>' +
                '<span class="selectArrow"></span>' +
            '</div><br>' +

            '<span id="newslettersubject">Betreff: <b>' + newsletter.subject + '</span></b>' +
            '<div id="subjectfield" style="display:none">' +
                '<div class="dualinp inpCol">' +
                    '<input id="subjectInput" type="text" class="longInp basic-data" value="' + newsletter.subject + '">' +
                '</div>' +
            '</div><br>' +

            '<span id="newslettertext">' + newsletter.text.replaceAll("&lt;","<").replaceAll("&gt;",">") + '</span>' +
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
            $(this).parent().parent().find("#newslettersubject").show();
            $(this).parent().parent().find("#newslettertext").show();
        } else {
            $(this).parent().parent().find("#newslettersubject").hide();
            $(this).parent().parent().find("#newslettertext").hide();
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