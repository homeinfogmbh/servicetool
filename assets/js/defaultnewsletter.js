var _defaultnewsletter = null;
$(document).ready(function() {
    getDefaultNewsletter().then(setDefaultNewsletter);
});

function setDefaultNewsletter(defaultnewsletter) {
    if (_defaultnewsletter === null)
        _defaultnewsletter = defaultnewsletter;
    let newsletterDOM = '<tr>' +
        '<td>' +
            '<span id="newslettersubject" style="font-size:30px;"><b>' + _defaultnewsletter.subject + '</span></b><br><br>' +
            '<div id="subjectfield" style="display:none">' +
                '<div class="dualinp inpCol">' +
                    '<input id="subjectInput" type="text" class="longInp basic-data" value="' + _defaultnewsletter.subject + '">' +
                '</div>' +
            '</div>' +
            '<span id="newslettertext">' + _defaultnewsletter.text.replaceAll("&lt;","<").replaceAll("&gt;",">") + '</span>' +
            '<div id="newslettertextfield" style="display:none">' +
                '<div class="dualinp inpCol">' +
                    '<textarea id="newsletterTextInput" class="longInp basic-data" style=resize:auto;">' + _defaultnewsletter.text.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("<br>","\n") + '</textarea>' +
                '</div>' +
            '</div>' +
            '<div id="newslettersaveclose" style="display:none">' +
                '<span class="whiteMark btn_saveNewsletter pointer" style="margin:0 20px 0 0" data-period="' + _defaultnewsletter.period + '">Speichern</span>' +
                '<span class="whiteMark btn_newsletter pointer">Abbrechen</span>' +
            '</div><br>' +
        '</td>' +
        '<td style="min-width:250px; text-align:right; vertical-align: top;">' +
            '<a href="#" class="editIcon btn_newsletter" style="padding:0 20px 0 20px" title="Newsletter bearbeiten"><img src="assets/img/edit.svg"></a>' +
        '</td>' +
    '</tr>';
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
        let id = _defaultnewsletter.id;
        let subject = $(this).parent().parent().find('#subjectInput').val();
        let text = $(this).parent().parent().find('#newsletterTextInput').val().replace(/\n/g, "<br>");
        let visible = $(this).parent().parent().find('#visible :selected').val() == "true";
        let period = $(this).data("period");
        _defaultnewsletter.subject = subject;
        _defaultnewsletter.text = text;
        _defaultnewsletter.visible = visible;
        _defaultnewsletter.period = period;
        saveNewsletter(id, subject, text, 1, period).then((data) => {
            setDefaultNewsletter();
        });
		e.preventDefault();
	});
    $("#pageloader").hide();
}

function getDefaultNewsletter() {
	return $.ajax({
		url: " https://sysmon.homeinfo.de/default_newsletter",
		type: "GET",
		error: function (msg) {
			setErrorMessage(msg, "Laden des Defaultnewsletters");
		}
	});	
}
function saveNewsletter(id, subject, text, visible, period) {
    $("#pageloader").show();
    let data = '{"subject":"' + subject + '","text":"' + text + '","visible":'+ visible + ', "period":"' + period + '"}';
	return $.ajax({
		url: "https://sysmon.homeinfo.de/patch_newsletter/" + id,
		type: "POST",
        data: data,
        contentType: 'application/json',
		error: function (msg) {
			setErrorMessage(msg, "Anlegen/ändern des Newsletters");
		}
	});	
}