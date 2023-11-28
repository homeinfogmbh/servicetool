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
                '<b>' + _MONTHS[date.getMonth()] + ' (' + date.getFullYear() + ')</b> <br>' +
                '<span id="newslettersubject" style="font-size:30px;"><b>' + newsletter.subject + '</span></b>' +
                '<div id="subjectfield" style="display:none">' +
                    'Betreff<br>' +
                    '<div class="dualinp inpCol">' +
                        '<input id="subjectInput" type="text" class="longInp basic-data" value="' + newsletter.subject + '">' +
                    '</div>' +
                '</div>' +

                //'<span id="newslettertext">' + newsletter.text.replaceAll("&lt;","<").replaceAll("&gt;",">") + '</span>' +
                '<div id="newslettertextfield" style="display:none">' +
                    'Text<br>' +
                    '<div class="dualinp inpCol">' +
                        '<textarea id="newsletterTextInput" class="longInp basic-data" style=resize:auto;">' + newsletter.text.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("<br>","\n") + '</textarea>' +
                    '</div>' +
                '</div>' +

                '<div id="newslettermorelinkfield" style="display:none">' +
                    'Mehr Link<br>' +
                    '<div class="dualinp inpCol">' +
                        '<textarea id="newslettermoreLinkInput" class="longInp basic-data" style=resize:auto;">' + newsletter.moreLink.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("<br>","\n") + '</textarea>' +
                    '</div>' +
                '</div>' +
                '<div id="newslettermoretextfield" style="display:none">' +
                    'Mehr Text<br>' +
                    '<div class="dualinp inpCol">' +
                        '<textarea id="newslettermoreTextInput" class="longInp basic-data" style=resize:auto;">' + newsletter.moreText.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("<br>","\n") + '</textarea>' +
                    '</div>' +
                '</div>' +
                '<div id="headerfield" style="display:none">' +
                    'Mail Header<br>' +
                    '<div class="dualinp inpCol">' +
                        '<input id="headerInput" type="text" class="longInp basic-data" value="' + newsletter.header + '">' +
                    '</div>' +
                '</div>' +

                '<div id="newsletterlisttext3field" style="display:none">' +
                    'Listen Text 3<br>' +
                    '<div class="dualinp inpCol">' +
                        '<textarea id="newsletterlistText3Input" class="longInp basic-data" style=resize:auto;">' + newsletter.listText3.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("<br>","\n") + '</textarea>' +
                    '</div>' +
                '</div>' +
                '<div id="header3field" style="display:none">' +
                    'Listen Header 3<br>' +
                    '<div class="dualinp inpCol">' +
                        '<input id="header3Input" type="text" class="longInp basic-data" value="' + newsletter.listHeader3 + '">' +
                    '</div>' +
                '</div>' +

                '<div id="newsletterlisttext2field" style="display:none">' +
                    'Listen Text 2<br>' +
                    '<div class="dualinp inpCol">' +
                        '<textarea id="newsletterlistText2Input" class="longInp basic-data" style=resize:auto;">' + newsletter.listText2.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("<br>","\n") + '</textarea>' +
                    '</div>' +
                '</div>' +
                '<div id="header2field" style="display:none">' +
                    'Listen Header 2<br>' +
                    '<div class="dualinp inpCol">' +
                        '<input id="header2Input" type="text" class="longInp basic-data" value="' + newsletter.listHeader2 + '">' +
                    '</div>' +
                '</div>' +

                '<div id="newsletterlisttext1field" style="display:none">' +
                    'Listen Text 1<br>' +
                    '<div class="dualinp inpCol">' +
                        '<textarea id="newsletterlistText1Input" class="longInp basic-data" style=resize:auto;">' + newsletter.listText1.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("<br>","\n") + '</textarea>' +
                    '</div>' +
                '</div>' +
                '<div id="header1field" style="display:none">' +
                    'Listen Header 1<br>' +
                    '<div class="dualinp inpCol">' +
                        '<input id="header1Input" type="text" class="longInp basic-data" value="' + newsletter.listHeader1 + '">' +
                    '</div>' +
                '</div>' +
                
                '<div id="newslettersaveclose" style="display:none">' +
                    '<span class="whiteMark btn_saveNewsletter pointer" style="margin:0 20px 0 0" data-id="' + newslettercounter + '">Speichern</span>' +
                    '<span class="whiteMark btn_newsletter pointer">Abbrechen</span>' +
                '</div><br>' +
            '</td>' +
            '<td style="min-width:250px; text-align:right; vertical-align: top;">' +
                '<span class="whiteMark btn_testNewsletter pointer" data-id="' + newslettercounter + '" title="Verschickt eine E-Mail an diesen Account">Testmailing</span>' +
                '<a href="#" class="editIcon btn_newsletter" style="padding:0 20px 0 20px" title="Newsletter bearbeiten"><img src="assets/img/edit.svg"></a>' +
                '<input type="checkbox" style="display:none;" name="newslettervisible" id="newslettervisible' + newslettercounter + '" ' + (newsletter.visible ?"checked" :"") + '>' +
                '<label for="newslettervisible' + newslettercounter + '"><span class="btn_visible checkboxStyle orangeCheckbox" data-id="' + newslettercounter + '"></span></label>' +
            '</td>' +
        '</tr>';
        newslettercounter++;
    }
    $('#newsletterdata').html(newsletterDOM);

    $('.btn_testNewsletter').click(function(e) {
        let newslettertitle = "Newsletter"
        let newslettertext = 'Der Newsletter: "' + _newsletter[$(this).data("id")].subject + '" (zwei Ansichten, zwei E-Mails) wurde verschickt.';
        if (!_newsletter[$(this).data("id")].visible) {
            newslettertitle = "Newsletter nicht freigegeben."
            newslettertext = 'Anstelle des angeforderten Newsletters wurde der Standard-Newsletter versendet. Bitte erteilen Sie vor dem Versand die Freigabe für den Newsletter "' + _newsletter[$(this).data("id")].subject + '"';
        }
        sendTestNewsletter(_newsletter[$(this).data("id")].id).then((data) => {
            $("#pageloader").hide();
            Swal.fire({
                title: newslettertitle,
                text: newslettertext,
                showCancelButton: false,
                confirmButtonColor: '#ff821d',
                iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                confirmButtonText: 'O.K.',
                buttonsStyling: true
            });
        });
	});    
    
    $('.btn_newsletter').click(function(e) {
        if ($(this).parent().parent().find("#subjectfield").is(":visible")) {
            $(this).parent().parent().find("#newslettervisibleselect").hide();
            $(this).parent().parent().find("#subjectfield").hide();
            $(this).parent().parent().find("#newslettertextfield").hide();
            $(this).parent().parent().find("#newslettersaveclose").hide();
            $(this).parent().parent().find("#newslettersubject").show();
            
            $(this).parent().parent().find("#newslettermorelinkfield").hide();
            $(this).parent().parent().find("#newslettermoretextfield").hide();
            $(this).parent().parent().find("#headerfield").hide();
            $(this).parent().parent().find("#newsletterlisttext3field").hide();
            $(this).parent().parent().find("#header3field").hide();
            $(this).parent().parent().find("#newsletterlisttext2field").hide();
            $(this).parent().parent().find("#header2field").hide();
            $(this).parent().parent().find("#newsletterlisttext1field").hide();
            $(this).parent().parent().find("#header1field").hide();
        } else {
            $(this).parent().parent().find("#newslettersubject").hide();
            //$(this).parent().parent().find("#newslettertext").hide();
            $(this).parent().parent().find("#newslettervisibleselect").show();
            $(this).parent().parent().find("#subjectfield").show();
            $(this).parent().parent().find("#newslettertextfield").show();
            $(this).parent().parent().find("#newslettersaveclose").show();

            $(this).parent().parent().find("#newslettermorelinkfield").show();
            $(this).parent().parent().find("#newslettermoretextfield").show();
            $(this).parent().parent().find("#headerfield").show();
            $(this).parent().parent().find("#newsletterlisttext3field").show();
            $(this).parent().parent().find("#header3field").show();
            $(this).parent().parent().find("#newsletterlisttext2field").show();
            $(this).parent().parent().find("#header2field").show();
            $(this).parent().parent().find("#newsletterlisttext1field").show();
            $(this).parent().parent().find("#header1field").show();
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
        let visible = _newsletter[$(this).data("id")].visible;
        let period = _newsletter[$(this).data("id")].period;
        let moreLink = $(this).parent().parent().find('#newslettermoreLinkInput').val().replace(/\n/g, "<br>");
        let moreText = $(this).parent().parent().find('#newslettermoreTextInput').val().replace(/\n/g, "<br>");
        let header = $(this).parent().parent().find('#headerInput').val();
        let listHeader1 = $(this).parent().parent().find('#header1Input').val();
        let listHeader2 = $(this).parent().parent().find('#header2Input').val();
        let listHeader3 = $(this).parent().parent().find('#header3Input').val();
        let listText1 = $(this).parent().parent().find('#newsletterlistText1Input').val().replace(/\n/g, "<br>");
        let listText2 = $(this).parent().parent().find('#newsletterlistText2Input').val().replace(/\n/g, "<br>");
        let listText3 = $(this).parent().parent().find('#newsletterlistText3Input').val().replace(/\n/g, "<br>");

        _newsletter[$(this).data("id")].subject = subject;
        _newsletter[$(this).data("id")].text = text;
        _newsletter[$(this).data("id")].moreLink = moreLink;
        _newsletter[$(this).data("id")].moreText = moreText;
        _newsletter[$(this).data("id")].header = header;
        _newsletter[$(this).data("id")].listHeader1 = listHeader1;
        _newsletter[$(this).data("id")].listHeader2 = listHeader2;
        _newsletter[$(this).data("id")].listHeader3 = listHeader3;
        _newsletter[$(this).data("id")].listText1 = listText1;
        _newsletter[$(this).data("id")].listText2 = listText2;
        _newsletter[$(this).data("id")].listText3 = listText3;

        saveNewsletter(id, subject, text, visible, period, moreLink, moreText, header, listHeader1, listHeader2, listHeader3, listText1, listText2, listText3).then((data) => {
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
function saveNewsletter(id, subject, text, visible, period, moreLink, moreText, header, listHeader1, listHeader2, listHeader3, listText1, listText2, listText3) {
    $("#pageloader").show();
    subject = subject.split('"').join('\\"').split("'").join("\'");
    text = text.split('"').join('\\"').split("'").join("\'");
    moreLink = moreLink.split('"').join('\\"').split("'").join("\'");
    moreText = moreText.split('"').join('\\"').split("'").join("\'");
    header = header.split('"').join('\\"').split("'").join("\'");
    listHeader1 = listHeader1.split('"').join('\\"').split("'").join("\'");
    listHeader2 = listHeader2.split('"').join('\\"').split("'").join("\'");
    listHeader3 = listHeader3.split('"').join('\\"').split("'").join("\'");
    listText1 = listText1.split('"').join('\\"').split("'").join("\'");
    listText2 = listText2.split('"').join('\\"').split("'").join("\'");
    listText3 = listText3.split('"').join('\\"').split("'").join("\'");
    let data = '{"subject":"' + subject + '","text":"' + text + '","visible":'+ visible + ', "period":"' + period + '","moreLink":"'+ moreLink + '", "moreText":"' + moreText + '","header":"'+ header + '", "listHeader1":"' + listHeader1 + '","listHeader2":"'+ listHeader2 + '", "listHeader3":"' + listHeader3 + '","listText1":"'+ listText1 + '", "listText2":"' + listText2 + '","listText3":"'+ listText3 + '"}';
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
function sendTestNewsletter(id) {
    $("#pageloader").show();
	return $.ajax({
		url:  "https://sysmon.homeinfo.de/send_test_mails/" + id,
		type: "POST",
		error: function (msg) {
			setErrorMessage(msg, "Anlegen/ändern des Newsletters");
		}
	});	
}