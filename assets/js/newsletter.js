const _MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
var _newsletter = null;
$(document).ready(function() {
    getNewsletter().then(setNewsletter);
    $('.btn_addnewsletter').click(function(e) {
        let date = new Date(_newsletter[0].period);
        date.setMonth(date.getMonth()+1);
        let period = date.getFullYear() + "-" + (date.getMonth()+1 < 10 ?"0" + (date.getMonth()+1) :date.getMonth()+1) + "-01";
        _newsletter.unshift({"id":-1, "subject":"", "text":"", "visible":false, "period":period, "moreLink":"", "moreText":"", "header":""});
        saveNewsletter(0);
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

                '<div id="headerfield" style="display:none">' +
                    'Titel<br>' +
                    '<div class="dualinp inpCol">' +
                        '<input id="headerInput" type="text" class="longInp basic-data" value="' + newsletter.header + '">' +
                    '</div>' +
                '</div>' +

                //'<span id="newslettertext">' + newsletter.text.replaceAll("&lt;","<").replaceAll("&gt;",">") + '</span>' +
                '<div id="newslettertextfield" style="display:none">' +
                    'Text<br>' +
                    '<div class="dualinp inpCol">' +
                        '<textarea id="newsletterTextInput" class="longInp basic-data" style=resize:auto;">' + newsletter.text.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("<br>","\n") + '</textarea>' +
                    '</div>' +
                '</div>' +

                '<div id="newslettermorelinktextfield" style="display:none">' + 
                    'Weiterführender Link<br>' +
                    '<div class="dualinp inpCol col-sm-5" style="float:left; margin-right:15px">' +
                        '<input id="newslettermoreLinkInput" type="text" class="longInp basic-data" value="' + newsletter.moreLink + '" placeholder="Link/Url">' +
                    '</div>' +
                    '<div class="dualinp inpCol col-sm-5">' +
                        '<input id="newslettermoreTextInput" type="text" class="longInp basic-data" value="' + newsletter.moreText + '" placeholder="Text">' +
                    '</div>' +
                '</div>' +

                '<div id="imagefield" style="display:none">' +
                    'Bild<br>' +
                    '<div id="imagefieldUpload' + newslettercounter + '">' +
                    '</div>' +
                '</div><br>' +
                '<div id="newsletterlist" data-id="' + newslettercounter + '" style="display:none">';
                if (newsletter.hasOwnProperty('listitems')) {
                    for (let listitem of newsletter.listitems) {
                        newsletterDOM += '<div class="newsletteritem" data-id="' + listitem.id + '">' +
                            'Liste Titel<br>' +
                            '<div class="dualinp inpCol">' +
                                '<input type="text" class="newsletterlistHeaderInput longInp basic-data" value="' + listitem.header + '">' +
                            '</div>' +
                            'Liste Text<br>' +
                            '<div class="dualinp inpCol">' +
                                '<textarea class="newsletterlistTextInput longInp basic-data" style=resize:auto;">' + listitem.text.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("<br>","\n") + '</textarea>' +
                            '</div>' +
                        '</div>';
                    };
                }
                newsletterDOM += '<div class="newsletteritem" data-id="-1">' +
                'Liste Titel<br>' +
                    '<div class="dualinp inpCol">' +
                        '<input type="text" class="newsletterlistHeaderInput longInp basic-data">' +
                    '</div>' +
                    'Liste Text<br>' +
                    '<div class="dualinp inpCol">' +
                        '<textarea class="newsletterlistTextInput longInp basic-data" style=resize:auto;"></textarea>' +
                    '</div>' + 
                '</div>';
                
                
                newsletterDOM += '</div>' +
                '<div id="newslettersaveclose" style="display:none">' +
                    '<span class="whiteMark btn_saveNewsletter pointer" style="margin:10px 20px 0 0" data-id="' + newslettercounter + '">Speichern</span>' +
                    '<span class="whiteMark btn_newsletter pointer">Abbrechen</span>' +
                '</div>' +
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
    for (let item = 0; item < newslettercounter; item++) {
        _newsletter[item].upload = new Upload($('#imagefieldUpload' + item), 1);
        if (_newsletter[item].hasOwnProperty('image'))
            _newsletter[item].upload.loadFile(_newsletter[item].image, 'Newsletter-Bild');
    }

    setListButton();

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
            
            $(this).parent().parent().find("#newslettermorelinktextfield").hide();
            $(this).parent().parent().find("#headerfield").hide();
            $(this).parent().parent().find("#newsletterlist").hide();
            $(this).parent().parent().find("#imagefield").hide();
        } else {
            $(this).parent().parent().find("#newslettersubject").hide();
            //$(this).parent().parent().find("#newslettertext").hide();
            $(this).parent().parent().find("#newslettervisibleselect").show();
            $(this).parent().parent().find("#subjectfield").show();
            $(this).parent().parent().find("#newslettertextfield").show();
            $(this).parent().parent().find("#newslettersaveclose").show();

            $(this).parent().parent().find("#newslettermorelinktextfield").show();
            $(this).parent().parent().find("#headerfield").show();
            $(this).parent().parent().find("#newsletterlist").show();
            $(this).parent().parent().find("#imagefield").show();
        }
		e.preventDefault();
	});

    $('.btn_visible').click(function(e) {
        let id = $(this).data("id");
        _newsletter[id].visible = !_newsletter[id].visible;
        saveNewsletter(id, false);
	});

    $('.btn_saveNewsletter').click(function(e) {
        let id = $(this).data("id");
        let listitems = [];
        let listitemsToADD = [];
        let listitemsToDELETE = [];
        let listitemsToPATCH = [];

        let found;
        for (let listitem of _newsletter[id].listitems) {
            found = false;
            $(this).parent().parent().find('.newsletteritem').each(function() {
                if ($(this).data('id') == listitem.id) {
                    listitemsToPATCH.push({"id":listitem.id, "header":$(this).find('.newsletterlistHeaderInput').val(), "newsletter":_newsletter[id].id, "text":$(this).find('.newsletterlistTextInput').val().replace(/\n/g, "<br>")});
                    found = true;
                    return false;
                };
            });
            if (!found)
                listitemsToDELETE.push({"id":listitem.id});
        }
        $(this).parent().parent().find('.newsletteritem').each(function() {
            if ($(this).find('.newsletterlistHeaderInput').val() != "") {
                if ($(this).data('id') == -1)
                    listitemsToADD.push({"header":$(this).find('.newsletterlistHeaderInput').val(), "newsletter":_newsletter[id].id, "text":$(this).find('.newsletterlistTextInput').val().replace(/\n/g, "<br>")});
            }
        });

        _newsletter[id].subject = $(this).parent().parent().find('#subjectInput').val();
        _newsletter[id].text = $(this).parent().parent().find('#newsletterTextInput').val().replace(/\n/g, "<br>");
        _newsletter[id].moreLink = $(this).parent().parent().find('#newslettermoreLinkInput').val().replace(/\n/g, "<br>");
        _newsletter[id].moreText = $(this).parent().parent().find('#newslettermoreTextInput').val().replace(/\n/g, "<br>");
        _newsletter[id].header = $(this).parent().parent().find('#headerInput').val();
        _newsletter[id].listitems = listitems;
        _newsletter[id].listitemsToADD = listitemsToADD;
        _newsletter[id].listitemsToDELETE = listitemsToDELETE;
        _newsletter[id].listitemsToPATCH = listitemsToPATCH;
        
        saveNewsletter(id);
		e.preventDefault();
	});
    $(".btn_addnewsletter").show();
    $("#pageloader").hide();
}

function setListButton() {
    $('.newsletterlistHeaderInput').on('input', function(e) {
        if ($(this).val().length == 0 && $(this).parent().parent().parent().find('.newsletteritem').length > 1) {
            $(this).parent().parent().remove();
        } else if ($(this).parent().parent().parent().find('.newsletteritem').find('.newsletterlistHeaderInput').last().val() != "") {
            $(this).parent().parent().parent().append('<div class="newsletteritem" data-id="-1">' +
            'Liste Titel<br>' +
                '<div class="dualinp inpCol">' +
                    '<input type="text" class="newsletterlistHeaderInput longInp basic-data">' +
                '</div>' +
                'Liste Text<br>' +
                '<div class="dualinp inpCol">' +
                    '<textarea class="newsletterlistTextInput longInp basic-data" style=resize:auto;"></textarea>' +
                '</div>' + 
            '</div>');
            $('.newsletterlistHeaderInput').unbind("input");
            setListButton();
        };
        e.preventDefault();
    });
}
function getNewsletter() {
    // Single newsletter: url: "https://sysmon.homeinfo.de/newsletter/30"
	return $.ajax({
		url: "https://sysmon.homeinfo.de/newsletters",
		type: "GET",
		error: function (msg) {
			setErrorMessage(msg, "Laden der Newsletter");
		}
	});	
}

function saveNewsletter(id, setnewsletter = true) {
    $("#pageloader").show();
    setNewsletterData(id).then((data) => {
        if (_newsletter[id].id == -1)
            _newsletter[id].id = data.id;
        let promises = [];
        if (_newsletter[id].hasOwnProperty('upload') && _newsletter[id].upload.fileList.length > 0 && _newsletter[id].upload.fileList[0].state != 'saved')
            promises.push(uploadImage(_newsletter[id].id, _newsletter[id].upload.fileList[0].file));
        else if (_newsletter[id].hasOwnProperty('upload') && _newsletter[id].hasOwnProperty('image') && _newsletter[id].upload.fileList.length == 0)
            promises.push(deleteImage(id));
        let item;
        if (_newsletter[id].hasOwnProperty('listitemsToADD')) {
            promises.push(addNewsLetterListItemInOrder(id));
        }
        if (_newsletter[id].hasOwnProperty('listitemsToPATCH')) {
            for (item of _newsletter[id].listitemsToPATCH)
                promises.push(patchNewsLetterListItem(item));
        }
        if (_newsletter[id].hasOwnProperty('listitemsToDELETE')) {
            for (item of _newsletter[id].listitemsToDELETE)
                promises.push(deleteNewsLetterListItem(item.id));
        }
        Promise.all(promises).then((data) => {
            if (data.length > 0 && data[0].hasOwnProperty("message") && data[0].message == "The file has been created.")
                _newsletter[id].image = data[0].id;
            if (setnewsletter)
                setNewsletter();
            else
                $("#pageloader").hide();
        });
    });
}
function setNewsletterData(id) {
    let subject = _newsletter[id].subject.split('"').join('\\"').split("'").join("\'");
    let text = _newsletter[id].text.split('"').join('\\"').split("'").join("\'");
    let visible = _newsletter[id].visible;
    let period = _newsletter[id].period;
    let moreLink = _newsletter[id].moreLink.split('"').join('\\"').split("'").join("\'");
    let moreText = _newsletter[id].moreText.split('"').join('\\"').split("'").join("\'");
    let header = _newsletter[id].header.split('"').join('\\"').split("'").join("\'");
    let data = {"subject":subject,"text":text, "visible":visible, "period":period,"moreLink":moreLink, "moreText":moreText, "header":header, "listHeader1":"", "listHeader2":"", "listHeader3":""};
    let url = "https://sysmon.homeinfo.de/patch_newsletter/" + _newsletter[id].id;
    if (_newsletter[id].id == -1)
        url = "https://sysmon.homeinfo.de/add_newsletter";
	return $.ajax({
		url: url,
		type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json',
		error: function (msg) {
			setErrorMessage(msg, "Anlegen/ändern des Newsletters");
		}
	});

}
function addNewsLetterListItemInOrder(newsletterid) {
    if (_newsletter[newsletterid].listitemsToADD.length == 0)
        return Promise.resolve("nothingtoadd");
    let newitem = _newsletter[newsletterid].listitemsToADD.shift();
    return addNewsLetterListItem(newitem).then((data) => {
        newitem.id = "-2"; // TODO ADD CORRECT LIST-ID
        _newsletter[newsletterid].listitems.push(newitem);
        addNewsLetterListItemInOrder(newsletterid)
    });
}

function addNewsLetterListItem(listitem) {
    return $.ajax({
		url: 'https://sysmon.homeinfo.de/newsletter_list_add/',
		type: 'POST',
        data: JSON.stringify(listitem),
        contentType: 'application/json',
		error: function (msg) {
			setErrorMessage(msg, "Anlegen des Newsletteritems");
		}
	});
}
function patchNewsLetterListItem(listitem) {
    let id = listitem.id;
    delete listitem.id;
    return $.ajax({
		url: 'https://sysmon.homeinfo.de/newsletter_list_patch/' + id,
		type: 'POST',
        data: JSON.stringify(listitem),
        contentType: 'application/json',
		error: function (msg) {
			setErrorMessage(msg, "Ändern des Newsletteritems");
		}
	});
}
function deleteNewsLetterListItem(listid) {
    return $.ajax({
		url: 'https://sysmon.homeinfo.de/newsletter_list_del/' + listid,
		type: 'POST',
		error: function (msg) {
			setErrorMessage(msg, "Löschen des Newsletteritems");
		}
	});
}
function uploadImage(newsletterid, file) {
    let form_data = new FormData();
    form_data.append('file', file);
    return $.ajax({
        type: 'POST',
        url: 'https://sysmon.homeinfo.de/newsletter-image/' + newsletterid,
        data: form_data,
        contentType: false,
        cache: false,
        processData: false,
        error: function (msg) {
            setErrorMessage(msg, "Upload des Newsletterimages");
        }
    });
}
function deleteImage(id) {
    return $.ajax({
        url: 'https://sysmon.homeinfo.de/newsletter-image/' + _newsletter[id].image,
        type: 'DELETE',
        success: function() {
            _newsletter[id].upload.fileList = [];
            delete _newsletter[id].image;
        },
        error: function (msg) {
            setErrorMessage(msg, "Löschen des Bildes");
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