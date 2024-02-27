$(document).ready(function() {
    $("#baseurl").text(_DDBOSURL);
    getSystems().then((systems) => {
        setOverwriteList(systems);
        setButtons(systems);
    });
});

function setOverwriteList(systems) {
    let overwriteDOM = "";
    for (let system of systems) {
        if (system.ddbOs && system.hasOwnProperty("deployment") && getDefaultDisplayURL(system) != system.deployment.url.split("&amp;").join("&")) {
            let address =  system.deployment.hasOwnProperty("address") ?system.deployment.address.street + " " + system.deployment.address.houseNumber + ", " + system.deployment.address.zipCode + " " + system.deployment.address.city :'<i>Keine Adresse angegeben</i>';
            overwriteDOM += '<tr>' +
                '<td>' + system.deployment.customer.abbreviation + '</td>' +
                '<td title="' + address + '">' + system.deployment.address.street + " " + system.deployment.address.houseNumber +  '</td>' +
                '<td style="word-break: break-all;">' + system.deployment.url + '</span></td>' +
                '<td><a href="display-details.html?id=' + system.id + '" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>' +
            '</tr>';
        }
    }
    //let url = new URL('https://stackoverflow.com/questions/1420881');
    //alert(url.origin);
    $("#overwritelist").html(overwriteDOM);
}
function setButtons(systems) {
    $(".btn_baseurl").attr("title", 'Ändern der Base URL');
    $('.btn_baseurl').click(function(e) {
        $("#baseurlInput").val($("#baseurl").text() === "-" ?"" :$("#baseurl").text());
        if ($("#baseurlfields").is(":visible"))
            $("#baseurlfields").hide();
        else
            $("#baseurlfields").show();
        $("#baseurlInput").focus();
        e.preventDefault();
    });
    $('.btn_savebaseurl').click(function(e) {
        _DDBOSURL = $("#baseurlInput").val();
        $("#baseurl").text(_DDBOSURL);
        $("#baseurlfields").hide();
        e.preventDefault();
    });


    $('.btn_displayurlDefault').click(function(e) {
        Swal.fire({
            title: 'Sind Sie sicher?',
            text: 'Wollen Sie die Display-URLs aller nicht gelisteten Systeme mit der Base URL "' + _DDBOSURL + '" neu einstellen? Die Applikation wird daraufhin versucht neu zu starten.',
            showCancelButton: true,
            confirmButtonColor: '#009fe3',
            cancelButtonColor: '#ff821d',
            iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
            confirmButtonText: 'Ja, neu einstellen!',
            cancelButtonText: 'Vorgang abbrechen!',
            buttonsStyling: true
        }).then(function(selection) {
            if (selection.isConfirmed === true)
                setDefaults(systems).then((data)=> {
                    $("#pageloader").hide();
                }, (error)=>{
                    $("#pageloader").hide();
                });
        })
        e.preventDefault();
    });
    $("#pageloader").hide();
}


function setDefaults(systems) {
    $("#pageloader").show();
    localStorage.removeItem("servicetool.systems");
    //localStorage.removeItem("servicetool.systemchecks");
    let promises = [];
    for (let system of systems) {
        if (system.ddbOs && system.hasOwnProperty("deployment") && system.deployment.url.indexOf("overwrite=true") == -1) {
            console.log(system.id);
            promises.push(changedisplayurl(getDefaultDisplayURL(system), system));
        }
    }
    return Promise.all(promises);
}

function changedisplayurl(displayurl, system) {
	let data = {"url":displayurl};
	return $.ajax({
		url: "https://termgr.homeinfo.de/administer/url/" + system.deployment.id,
		type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json'
	});   
}