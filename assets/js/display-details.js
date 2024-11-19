var _id;
var _display = null;
var _isInBlacklist = false;
var _deployments = null;
var _applicationVersion = null;
var _deploymentHistory = null;
var _months = {"01":"Januar","02":"Februar","03":"März","04":"April","05":"Mai","06":"Juni","07":"Juli","08":"August","09":"September","10":"Oktober","11":"November","12":"Dezember",}
$(document).ready(function() {
    _id = getURLParameterByName('id');
    Promise.all(getListOfSystemChecks()).then((data) => {
        systemCheckCompleted(data);
        getDeploymentHistory().then((data)=>setHistory(data), denyHistory);
        getSystemChecks().then((data)=> {
            setDetails(data);
            setThirtyDays(data);
            setErrorLog(data);
            setButtons();
            if (_display.operatingSystem === "Arch Linux") {
                if (_display.ddbOs) {
                    $('[name="display-mode"]').click(function(e) {
                        let displayurl = "https://portal.homeinfo.de/sysmon/cursortestseite";
                        if (_display.hasOwnProperty("deployment"))
                            displayurl = _display.deployment.hasOwnProperty('url') ?_display.deployment.url.split("&amp;").join("&").replace("?blackmode=true", "").replace("&blackmode=true", "").replace("?displaytest=true", "").replace("&displaytest=true", "").replace("?overwrite=true", "").replace("&overwrite=true", "") :getDefaultDisplayURL(_display);
                        let title = "Normalmodus eingestellt";
                        if ($(this).val() == "OFF") {
                            displayurl += ((displayurl).indexOf("?") == -1 ?"?" :"&") + "blackmode=true&overwrite=true";
                            title = "Schwarzmodus eingestellt";
                        } else if ($(this).val() == "displaytest") {
                            if (_display.hasOwnProperty("deployment"))
                                displayurl += ((displayurl).indexOf("?") == -1 ?"?" :"&") + "displaytest=true&overwrite=true";
                            title = "Bildschirmtest eingestellt";
                        } else if ($(this).val() == "PRODUCTIVE") {
                            title = "Normalmodus eingestellt";
                        } else if ($(this).val() == "INSTALLATION_INSTRUCTIONS") {
                            title = "Installationsanleitung eingestellt";
                        }
                        if (_display.hasOwnProperty("deployment"))
                            _display.deployment.url = displayurl;
                        $("#displayurl").text(displayurl);
                        changedisplayurl(displayurl, _display.hasOwnProperty("deployment")).then((data) => {
                            $("#pageloader").hide();
                            Swal.fire({
                                title: title,
                                html: "Erfolgreich übertragen: " + data.success[0] + '<br>Nicht übertragen: ' + (data.failed.hasOwnProperty('offline') ?data.failed.offline :"-"),
                                showCancelButton: false,
                                confirmButtonColor: '#ff821d',
                                iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                                confirmButtonText: 'O.K.',
                                buttonsStyling: true
                            });
                        });
                        if ($(this).val() == "INSTALLATION_INSTRUCTIONS" || $(this).val() == "PRODUCTIVE") {
                            setApplicationState().then(()=>{
                                $("#pageloader").hide();
                            }, ()=>{
                                $("#pageloader").hide();
                            });
                        }
                    });

                    let mode = "Unknown";
                    mode = $("#displayurl").text().indexOf("blackmode=true") != -1 ?"BLACK" :mode;
                    mode = $("#displayurl").text().indexOf("displaytest=true") != -1 ?"TESTMODE" :mode;
                    switch (mode) {
                        case "TESTMODE":
                            $("#test-mode").prop("checked", true);
                            $("#black-mode").prop("checked", false);
                            $("#installation-instructions-mode").prop("checked", false);
                            $("#productive-mode").prop("checked", false);
                            $("#display-mode-unknown").hide();
                            $(".tw-toggle").show();
                            break;
                        case "BLACK":
                            $("#black-mode").prop("checked", true);
                            $("#test-mode").prop("checked", false);
                            $("#installation-instructions-mode").prop("checked", false);
                            $("#productive-mode").prop("checked", false);
                            $("#display-mode-unknown").hide();
                            $(".tw-toggle").show();
                            break;
                        default:
                            getSystemInfo().then((data) => {
                                setSystemysinfo(data);
                                $("#display-mode-unknown").hide();
                                if (data.hasOwnProperty("application") && data.application.hasOwnProperty("mode")) {
                                    $(".tw-toggle").show();
                                    switch (data.application.mode) {
                                        case "installationInstructions":
                                            $("#test-mode").prop("checked", false);
                                            $("#black-mode").prop("checked", false);
                                            $("#installation-instructions-mode").prop("checked", true);
                                            $("#productive-mode").prop("checked", false);
                                            break;
                                        case "chromium":
                                            $("#test-mode").prop("checked", false);
                                            $("#black-mode").prop("checked", false);
                                            $("#installation-instructions-mode").prop("checked", false);
                                            $("#productive-mode").prop("checked", true);
                                            break;
                                        default:
                                            $("#display-mode-unknown").show();
                                            $("#display-mode-unknown").text("(Status: UNBEKANNT: " + data.application.mode + ")");
                                            break;
                                    }
                                } else {
                                    $("#display-mode-unknown").show();
                                    $("#display-mode-unknown").text("(Status: UNBEKANNT)");
                                }
                            }, ()=>{
                                $("#display-mode-unknown").text("(Status: UNBEKANNT)");
                            });
                            break;
                    }
                } else {
                    getSystemInfo().then((data) => {
                        setSystemysinfo(data);
                        try { $("#applicationDesign").text('"' + data.presentation.configuration.design.toUpperCase() + '"'); } catch(error) { $("#applicationDesign").text("-"); }
                        $("#display-mode-unknown").hide();
                        if (data.hasOwnProperty("application") && data.application.hasOwnProperty("mode")) {
                            $(".tw-toggle").show();
                            switch (data.application.mode) {
                                case "PRODUCTIVE":
                                    $("#black-mode").prop("checked", false);
                                    $("#installation-instructions-mode").prop("checked", false);
                                    $("#productive-mode").prop("checked", true);
                                    break;
                                case "INSTALLATION_INSTRUCTIONS":
                                    $("#black-mode").prop("checked", false);
                                    $("#installation-instructions-mode").prop("checked", true);
                                    $("#productive-mode").prop("checked", false);
                                    break;
                                default:
                                    $("#black-mode").prop("checked", true);
                                    $("#installation-instructions-mode").prop("checked", false);
                                    $("#productive-mode").prop("checked", false);
                                    break;
                            }
                        } else {
                            $("#display-mode-unknown").show();
                            $("#display-mode-unknown").text("(Status: UNBEKANNT)");
                        }
                        $('[name="display-mode"]').click(function(e) {
                            localStorage.removeItem("servicetool.systemchecks");
                            setApplicationState().then(checkSystem).then(()=>{
                                $("#pageloader").hide();
                            }, ()=>{
                                $("#pageloader").hide();
                            });
                        });
                    }, ()=>{
                        try {
                            if (_display.checkResults[0].applicationState === "html" || _display.checkResults[0].applicationState === "air") {
                                $("#black-mode").prop("checked", false);
                                $("#installation-instructions-mode").prop("checked", false);
                                $("#productive-mode").prop("checked", true);
                            }
                        } catch(error) {    }
                        $("#applicationDesign").text("-");
                        $("#display-mode-unknown").text("(Status: UNBEKANNT)");
                    });
                }
            }
        });
    }, ()=>{
        $("#errorlog").html("<tr><td>Keine Einträge geladen</td></tr>");
    });
    $('.btn_changeDeploymentAddress').click(function(e) {
        if (_display !== null && _display.hasOwnProperty("deployment") && _display.deployment.hasOwnProperty("address") && _display.deployment.address.street !== "Keine Adresse") {
            $("#deploymentAddressStreetInput").val(_display.deployment.address.street);
            $("#deploymentAddressHouseNumberInput").val(_display.deployment.address.houseNumber);
            $("#deploymentAddressZipCodeInput").val(_display.deployment.address.zipCode);
            $("#deploymentAddressCityInput").val(_display.deployment.address.city);
            if ($("#deploymentAddressfields").is(":visible"))
                $("#deploymentAddressfields").hide();
            else
                $("#deploymentAddressfields").show();
            $("#deploymentAddressStreetInput").focus();
        }
		e.preventDefault();
	});
    $('.btn_saveDeploymentAddress').click(function(e) {
        let address = {'street':$("#deploymentAddressStreetInput").val(), 'houseNumber':$("#deploymentAddressHouseNumberInput").val(), 'zipCode':$("#deploymentAddressZipCodeInput").val(), 'city':$("#deploymentAddressCityInput").val()};
        changeDeployment("address", address, _display).then(() => {
            localStorage.removeItem("servicetool.systemchecks");
            $("#displaytitle").text('Display: ' + $("#deploymentAddressStreetInput").val() + " " + $("#deploymentAddressHouseNumberInput").val() + ", " + $("#deploymentAddressZipCodeInput").val() + " " + $("#deploymentAddressCityInput").val());
            $("#deploymentAddressfields").hide();
            $("#pageloader").hide()
        });
		e.preventDefault();
	});

    $('.btn_serialNumber').click(function(e) {
        $("#serialNumberInput").val($("#serialNumber").text() === "-" ?"" :$("#serialNumber").text());
        if ($("#serialNumberfields").is(":visible"))
            $("#serialNumberfields").hide();
        else
            $("#serialNumberfields").show();
        $("#serialNumberInput").focus();
		e.preventDefault();
	});
    $('.btn_saveSerialNumber').click(function(e) {
        if (_display !== null) { 
            let serialNumber = $("#serialNumberInput").val().trim() === "" ?null :$("#serialNumberInput").val();
            changeSerialNumber(serialNumber).then(() => {
                localStorage.removeItem("servicetool.systemchecks");
                $("#serialNumber").text(serialNumber === null ?"-" :serialNumber);
                $("#serialNumberfields").hide();
                $("#pageloader").hide()
            });
        }
		e.preventDefault();
	});

    $('.btn_warranty').click(function(e) {
        $("#warrantyInput").val(_display.warranty.substring(0,7));
        if ($("#warrantyfields").is(":visible"))
            $("#warrantyfields").hide();
        else
            $("#warrantyfields").show();
        $("#warrantyInput").focus();
		e.preventDefault();
	});
    $('.btn_savewarranty').click(function(e) {
        if (_display !== null) { 
            let warranty = $("#warrantyInput").val()+"-01";
            changeWarranty(warranty).then(() => {
                localStorage.removeItem("servicetool.systemchecks");
                $("#warranty").text(_months[warranty.substring(5,7)] + ' ' + warranty.substring(0,4));
                $("#warrantyfields").hide();
                $("#pageloader").hide()
            });
        }
		e.preventDefault();
	});

    $('.btn_annotation').click(function(e) {
        if ($("#annotationfields").is(":visible"))
            $("#annotationfields").hide();
        else
            $("#annotationfields").show();
        $("#annotationInput").focus();
		e.preventDefault();
	});
    $('.btn_saveAnnotation').click(function(e) {
        if (_display !== null && _display.hasOwnProperty("deployment")) {
            let annotation = $("#annotationInput").val().trim() === "" ?null :$("#annotationInput").val();
            changeDeployment("annotation", annotation, _display).then(()=>{
                localStorage.removeItem("servicetool.systemchecks");
                $("#annotation").text(annotation === null ?"-" :annotation);
                $("#annotationfields").hide();
                $("#pageloader").hide()
            });
        }
		e.preventDefault();
	});
    
    $('.btn_wireguard').click(function(e) {
        if (_display.hasOwnProperty("pubkey"))
            navigator.clipboard.writeText(_display.pubkey);
		e.preventDefault();
	});
    $('.btn_internetconnection').click(function(e) {
        if ($("#connectionsDropdown").hasClass("show"))
            $("#connectionsDropdown").removeClass("show");
        else
            $("#connectionsDropdown").addClass("show");
		e.preventDefault();
	});
    $('.btn_connection').click(function(e) {
        localStorage.removeItem("servicetool.systemchecks");
        $("#connectionsDropdown").removeClass("show");
        $("#internetconnection").text($(this).text());
        if (_display !== null && _display.hasOwnProperty("deployment")) {
            let connection;
            if ($(this).text() == "LAN/DSL")
                connection = "LANDSL";
            if ($(this).text() == "LTE/UMTS")
                connection = "UMTS";
            if ($(this).text() == "WLAN ➝ DSL Router")
                connection = "WLANDSL";
            if ($(this).text() == "WLAN ➝ LTE Router")
                connection = "WLANLTE";
            changeDeployment("connection", connection, _display).then(()=>{$("#pageloader").hide()});
        }
		e.preventDefault();
	});

    $('.btn_legacyddbos').click(function(e) {
        if ($("#osDropdown").hasClass("show"))
            $("#osDropdown").removeClass("show");
        else
            $("#osDropdown").addClass("show");
		e.preventDefault();
	});
    $('.btn_os').click(function(e) {
        localStorage.removeItem("servicetool.systemchecks");
        $("#osDropdown").removeClass("show");
        $("#os").text(_display.operatingSystem + ($(this).text() == "DDB OS" ? " (DDB OS)":""));
        if (_display !== null && _display.hasOwnProperty("deployment")) {
            let ddbos = $(this).text() == "DDB OS" ?true :false;
            changeOs(ddbos).then(()=>{$("#pageloader").hide()});
        }
		e.preventDefault();
	});

    $('.btn_publictransport').click(function(e) {
        if (_display !== null && _display.hasOwnProperty("deployment")) {
            if ($("#addressfields").is(":visible"))
                $("#addressfields").hide();
            else
                $("#addressfields").show();
            $("#street").focus(); 
        }
		e.preventDefault();
	});
    
    $('.btn_savePublicTransport').click(function(e) {
        if (_display !== null && _display.hasOwnProperty("deployment")) {
            let address = [$("#street").val(), $("#houseNumber").val(), $("#zipCode").val(), $("#city").val()];
            if (address[0].trim() === "" && address[1].trim() === "" && address[2].trim() === "" && address[3].trim() === "") {
                address = null;
            } else if (address[0].trim() === "" || address[1].trim() === "" || address[2].trim() === "" || address[3].trim() === "") {
                return null;
            }
            setPublicTransport(address).then(() => {
                localStorage.removeItem("servicetool.systemchecks");
                if (address === null) {
                    address = _display.deployment.hasOwnProperty("address") && _display.deployment.address.street !== "Keine Adresse" ?_display.deployment.address.street + " " + _display.deployment.address.houseNumber + ", " + _display.deployment.address.zipCode + " " + _display.deployment.address.city :'<i>Keine Adresse angegeben</i>';
                    $("#publicTransportAddress").html('<span title="' + address + '">' + address.substring(0, 20) + (address.length > 20 ? '...' :'') + '</span>');
                } else
                    $("#publicTransportAddress").html('<span title="' + address[0] + " " + address[1] + ", " + address[2] + " " + address[3] + '">' + (address[0] + " " + address[1] + ", " + address[2] + " " + address[3]).substring(0, 20) + '...</span>');
                $("#addressfields").hide();
                $("#pageloader").hide()
            });
        }
		e.preventDefault();
	});
    $('.btn_displayurlCopy').click(function(e) {
        if (_display != null && _display.hasOwnProperty('deployment') && _display.deployment.hasOwnProperty('url') && _display.deployment.hasOwnProperty('url'))
            navigator.clipboard.writeText(_display.deployment.url.split("&amp;").join("&"));
		e.preventDefault();
	});
    $('.btn_sendURL').click(function(e) {
        changedisplayurl(_display.deployment.url).then((data) => {
            $("#pageloader").hide();
            Swal.fire({
                title: "URL gesendet",
                html: "Erfolgreich übertragen: " + data.success[0] + '<br>Nicht übertragen: ' + (data.failed.hasOwnProperty('offline') ?data.failed.offline :"-"),
                showCancelButton: false,
                confirmButtonColor: '#ff821d',
                iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                confirmButtonText: 'O.K.',
                buttonsStyling: true
            });
        });
		e.preventDefault();
	});
    $('.btn_check').click(function(e) {
        localStorage.removeItem("servicetool.systemchecks");
        localStorage.removeItem("servicetool.applicationversion");
        if (_display !== null && _display.hasOwnProperty("checkResults") && _display.checkResults.length > 0 && _display.checkResults[0].hasOwnProperty("offlineSince")) {
            Swal.fire({
                title: 'System war offline',
                text: "Dieses System wurde beim letzten Check 'offline' gemessen. Ein Test kann aufgrund fehlender Erreichbarkeit unerwartet lange dauern.",
                showCancelButton: true,
                confirmButtonColor: '#009fe3',
                cancelButtonColor: '#ff821d',
                iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                confirmButtonText: 'Fortsetzen!',
                cancelButtonText: 'Abbrechen',
                buttonsStyling: true
            }).then(function(selection) {
                if (selection.isConfirmed === true)
                    checkSystem().then(setChecks);
            });
        } else
            checkSystem().then(setChecks);
		e.preventDefault();
	});

    $('.btn_deployment').click(function(e) {
        localStorage.removeItem("servicetool.systemchecks");
        if ($("#deploymentsDropdown").hasClass("show"))
            $("#deploymentsDropdown").removeClass("show");
        else if (_deployments === null) {
            $("#pageloader").show();
            getDeployments().then(listDeployments);
        } else
            listDeployments();
		e.preventDefault();
	});
    $('#deploymentsearch').on('input',function(e) {
        listDeployments();
        e.preventDefault();
    });	
    $('.btn_deleteDeployment').click(function(e) {
        localStorage.removeItem("servicetool.systemchecks");
        if (_display !== null && _display.hasOwnProperty("deployment")) {
            Swal.fire({
                title: 'Sind Sie sicher?',
                text: "Wollen Sie das System wirklich lösen?",
                showCancelButton: true,
                confirmButtonColor: '#009fe3',
                cancelButtonColor: '#ff821d',
                iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                confirmButtonText: 'Ja, lösen!',
                cancelButtonText: 'Vorgang abbrechen!',
                buttonsStyling: true
            }).then(function(selection) {
                if (selection.isConfirmed === true)
                    setDeployments(_id).then(()=>{
                        _systemChecksPromise = []; // in common
                        Promise.all(getListOfSystemChecks()).then(systemCheckCompleted);
                    });
            });
        }
        e.preventDefault();
	});

    $('.btn_installed').click(function(e) {
        localStorage.removeItem("servicetool.systemchecks");
        setFit().then(()=>{$("#pageloader").hide()});
        if ($('input[name=Verbaut]:checked').val() === 'on')
            $(this).attr("title", "Ist nicht verbaut");
        else
            $(this).attr("title", "Ist verbaut");
	}); 
    $('.btn_testsystem').click(function(e) {
        if (_display !== null && _display.hasOwnProperty("deployment")) {
            localStorage.removeItem("servicetool.systemchecks");
            setTesting($('input[name=Testgerät]:checked').val() !== 'on').then(()=>{$("#pageloader").hide()}, ()=>{$("#pageloader").hide()});
            if ($('input[name=Testgerät]:checked').val() === 'on')
                $(this).attr("title", "Ist kein Testsystem");
            else
                $(this).attr("title", "Ist ein Testsystem");
        }
	});
});


function getSystemChecks() {
    return $.ajax({
        url: "https://sysmon.homeinfo.de/checks/" + _id,
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Laden der Checklist");
        }
    });
}

function systemCheckCompleted(data) {
    _applicationVersion = data[1];
    let foundsystem = {};
    for (let system in data[0]) {
        if (data[0][system].id == _id) {
            foundsystem = data[0][system];
            for (let blacklistitem of data[2]) {
                if (_id == blacklistitem.id) {
                    _isInBlacklist = true;
                    break;
                }
            }
            break;
        }
    }
    if ($.isEmptyObject(foundsystem))
        getSystem().then(setDetails);
    else
        setDetails(foundsystem);
}
function setDetails(data) {
    _display = data.hasOwnProperty(_id) ?data[_id] :data;
    let address = _display.hasOwnProperty("deployment") ?_display.deployment.hasOwnProperty("address") && _display.deployment.address.street !== "Keine Adresse" ?_display.deployment.address.street + " " + _display.deployment.address.houseNumber + ", " + _display.deployment.address.zipCode + " " + _display.deployment.address.city :'<i>Keine Adresse angegeben</i>' :'<i>Keinem Standort zugewiesen</i>';
    $("#displaytitle").html("Display: " + address);
    try {
        $('#metadescription').attr("content", address);
        $("#sitetitle").text(_display.deployment.customer.company.name + " " + _id);
        $("#completecustomername").html(_display.deployment.customer.company.name + ' (Knr. <a target="_self" style="color:white;" href="https://testing.homeinfo.de/sysmon2/listenansicht.html?customer=' + _display.deployment.customer.id + '">' + _display.deployment.customer.id + '</a>)');
    } catch(err) {   }
    // Display Overview
    $("#model").text(_display.hasOwnProperty("model") ?_display.model.split('&quot;').join('"') :'-');
    $("#serialNumber").text(_display.hasOwnProperty("serialNumber") ?_display.serialNumber :'-');
    $("#warranty").text(_display.hasOwnProperty("warranty") ?_months[_display.warranty.substring(5,7)] + ' ' + _display.warranty.substring(0,4) :'-');
    $("#ipv6").text(_display.ipv6address);
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0) {
        $("#ramtotal").text(_display.checkResults[0].hasOwnProperty("ramTotal") ?parseInt(_display.checkResults[0].ramTotal/1024) + "MB" :"-");
        $("#ramAvailable").text(_display.checkResults[0].hasOwnProperty("ramAvailable") ?parseInt(_display.checkResults[0].ramAvailable/1024) + "MB":"-");
    }
    if (_display.hasOwnProperty("deployment")) {
        $("#screentype").text(_display.deployment.type);
        let connection;
        if (_display.deployment.connection == "LANDSL")
            connection = "LAN/DSL";
        if (_display.deployment.connection == "UMTS")
            connection = "LTE/UMTS";
        if (_display.deployment.connection == "WLANDSL")
            connection = "WLAN ➝ DSL Router";
        if (_display.deployment.connection == "WLANLTE")
            connection = "WLAN ➝ LTE Router";
        $("#internetconnection").text(connection);
        let lptAddress = _display.deployment.hasOwnProperty("lptAddress") ?_display.deployment.lptAddress.street + " " + _display.deployment.lptAddress.houseNumber + ", " + _display.deployment.lptAddress.zipCode + " " + _display.deployment.lptAddress.city :address
        $("#publicTransportAddress").html('<span title="' + lptAddress + '">' + lptAddress.substring(0, 18) + (lptAddress.length > 18 ? '...' :'') + '</span>');
        if (_display.deployment.hasOwnProperty("lptAddress")) {
            $("#street").val(_display.deployment.lptAddress.street);
            $("#houseNumber").val(_display.deployment.lptAddress.houseNumber);
            $("#zipCode").val(_display.deployment.lptAddress.zipCode);
            $("#city").val(_display.deployment.lptAddress.city);
        } else if (_display.hasOwnProperty("deployment") && _display.deployment.hasOwnProperty("address") && _display.deployment.address.street !== "Keine Adresse") {
            $("#street").val(_display.deployment.address.street);
            $("#houseNumber").val(_display.deployment.address.houseNumber);
            $("#zipCode").val(_display.deployment.address.zipCode);
            $("#city").val(_display.deployment.address.city);
        }
        $("#deploymentID").text(_display.deployment.id);
        $("#annotation").html(_display.deployment.hasOwnProperty("annotation") ?"<span title='" + _display.deployment.annotation + "'>" + _display.deployment.annotation.substring(0, 20) + (_display.deployment.annotation.length > 20 ? '...' :'') + "</span>" :"-");
        $("#annotationInput").val(_display.deployment.hasOwnProperty("annotation") ?_display.deployment.annotation.split("&amp;").join("&") :'');
        let displayurl = _display.deployment.hasOwnProperty('url') ?(_display.deployment.url.split("&amp;").join("&") == getDefaultDisplayURL(_display) ?'default' :_display.deployment.url) :"-";
        $("#displayurl").html('<span>' + displayurl + '</span>');
        let technicianAnnotation = '<td>' + 
            '<span class="btn_technicianAnnotation">' + (_display.deployment.hasOwnProperty('technicianAnnotation') ?_display.deployment.technicianAnnotation + ' <a href="#" class="editIcon"><img src="assets/img/edit.svg" alt=""></a>':'<a href="#" class="editIcon"><img src="assets/img/edit.svg" alt=""></a>') + '</span>' +
            '<div id="technicianAnnotationfields" style="display:none; padding-top:5px">' +
                '<div class="dualinp inpCol">' +
                    '<textarea id="technicianAnnotationInput" class="technicianAnnotationInput longInp basic-data" style=resize:auto;">' + (_display.deployment.hasOwnProperty('technicianAnnotation') ?_display.deployment.technicianAnnotation :"") + '</textarea>' +
                '</div>' +
                '<div style="float:right">' +
                    '<span class="whiteMark btn_saveTechnicianAnnotation pointer" data-deployment="' + _display.deployment.id + '">Speichern</span>' +
                    '<span class="whiteMark btn_closeTechnicianAnnotation pointer">Abbrechen</span>' +
                '</div>' +
            '</div>' +
        '</td>' 
        $("#technicalannotation").html("<tr>" + technicianAnnotation + "</tr>");
        $('.btn_technicianAnnotation').click(function(e) {
            if ($(this).parent().find("#technicianAnnotationfields").is(":visible"))
                $(this).parent().find("#technicianAnnotationfields").hide();
            else
                $(this).parent().find("#technicianAnnotationfields").show();
            $(this).parent().find('#technicianAnnotationInput').focus();
            e.preventDefault();
        });
        $('.technicianAnnotationInput').keydown(function(e) {
            if (e.which === 13) {
                e.preventDefault();
                this.value = this.value.substring(0, this.selectionStart) + "" + "\n" + this.value.substring(this.selectionEnd, this.value.length);
            }
        });
        $('.btn_closeTechnicianAnnotation').click(function(e) {
            $(this).parent().parent().parent().find('.btn_technicianAnnotation').click();
            e.preventDefault();
        });
        $('.btn_saveTechnicianAnnotation').click(function(e) {
                let technicianAnnotation = $(this).parent().parent().parent().find('#technicianAnnotationInput').val().trim() === "" ?null :$(this).parent().parent().parent().find('#technicianAnnotationInput').val();
                saveTechnicianAnnotation($(this).data('deployment'), technicianAnnotation).then(() => {
                    localStorage.removeItem("servicetool.systemchecks");
                    $(this).parent().parent().parent().find('.btn_technicianAnnotation').text(technicianAnnotation === null ?"" :technicianAnnotation);
                    $(this).parent().parent().parent().find("#technicianAnnotationfields").hide();
                    $("#pageloader").hide()
                });
            e.preventDefault();
        });
    }
    $("#wireguard").html(_display.hasOwnProperty("pubkey") ?"<span title='" + _display.pubkey + "'>" + _display.pubkey.substring(0, 20) + "...</span>" :"-");
    $("#systemID").text(_display.id);
    $("#os").text(_display.operatingSystem + (_display.ddbOs ? " (DDB OS)":""));
    
    // Funktionen
    if (_display.fitted) {
        $("#Verbaut").prop("checked", true);
        $(".btn_installed").attr("title", "Ist verbaut");
    } else {
        $("#Verbaut").prop("checked", false);
        $(".btn_installed").attr("title", "Ist nicht verbaut");
    }
    if (_display.testing) {
        $("#Testgerät").prop("checked", true);
        $(".btn_testsystem").attr("title", "Ist ein Testsystem");
    } else {
        $("#Testgerät").prop("checked", false);
        $(".btn_testsystem").attr("title", "Ist kein Testsystem");
    }
    if (_display.hasOwnProperty("deployment")) {
        $(".btn_testsystem").css("opacity", "1");
        $(".btn_testsystem").addClass("pointer");
        $(".btn_testsystem").attr("title", "");
        $(".btn_sync").css("opacity", "1");
        $(".btn_sync").addClass("pointer");
        $(".btn_sync").attr("title", "");
        $(".btn_publictransport").css("opacity", "1");
        $(".btn_publictransport").addClass("pointer");
        $(".btn_publictransport").attr("title", "");
        $(".btn_deleteDeployment").css("opacity", "1");
        $(".btn_deleteDeployment").addClass("pointer");
        $(".btn_deleteDeployment").attr("title", "Deployment lösen");
        if (_display.deployment.processing) {
            $("#Processing").prop("checked", true);
            $(".btn_processing").attr("title", "Status: Befindet sich in Bearbeitung");
        } else {
            $("#Processing").prop("checked", false);
            $(".btn_processing").attr("title", "Status: Bereit");
        }
    } else {
        $(".btn_testsystem").css("opacity", "0.3");
        $(".btn_testsystem").removeClass("pointer");
        $(".btn_testsystem").attr("title", "Keine Zuordnung vorhanden");
        $(".btn_sync").css("opacity", "0.3");
        $(".btn_sync").removeClass("pointer");
        $(".btn_sync").attr("title", "Keine Zuordnung vorhanden");
        $(".btn_publictransport").css("opacity", "0.3");
        $(".btn_publictransport").removeClass("pointer");
        $(".btn_publictransport").attr("title", "Keine Zuordnung vorhanden");
        $(".btn_deleteDeployment").css("opacity", "0.3");
        $(".btn_deleteDeployment").removeClass("pointer");
        $(".btn_deleteDeployment").attr("title", "Keine Zuordnung vorhanden");  
        $(".btn_eye").css("opacity", "0.3");
        $(".btn_eye").removeClass("pointer");
        $(".btn_eye").attr("title", "Keine Zuordnung vorhanden");
    }
        
    // Systemchecks
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0)
        setChecks(_display.checkResults[0]);
    else
        $("#pageloader").hide();
}

function setChecks(lastCheck) {
    if (isOnDate(lastCheck.timestamp, 24)) {
        $("#systemcheck").html('<span class="blueMark">ok</span>');
        //lastCheck.hasOwnProperty("offlineSince") && lastCheck.sshLogin !== "success" && !lastCheck.icmpRequest
        //$("#offline").html(lastCheck.hasOwnProperty("offlineSince") && lastCheck.sshLogin !== "success" ?'<span class="orangeMark">offline</span>' :'<span class="blueMark">online</span>');
        $("#offline").html("<div style='float:left'>" + (!lastCheck.online /*lastCheck.sshLogin === "failed" && !lastCheck.icmpRequest*/ ?'<span class="orangeMark">offline</span>' :'<span class="blueMark">online</span>') + '<span title="System befindet sich in der Blacklist" style="width:24px; display:block; float:right">' + (_isInBlacklist ?_coffin :'') + '</span></div>');
        $("#sensors").html(lastCheck.sensors === "failed" ?'<span class="orangeMark">overheated</span>' :lastCheck.sensors === "success" ?'<span class="blueMark">ok</span>' :'<span class="blueMark">' + lastCheck.sensors + '</span>');
        $("#root").html(lastCheck.rootNotRo === "failed" ?'<span class="orangeMark">' + lastCheck.rootNotRo + '</span>' :'<span class="blueMark">' + lastCheck.rootNotRo + '</span>');
        $("#ssd").html(lastCheck.smartCheck === "failed" ?'<span class="orangeMark">' + lastCheck.smartCheck + '</span>' :'<span class="blueMark">' + lastCheck.smartCheck + '</span>');
        $("#icmp").html(lastCheck.icmpRequest ?'<span class="blueMark">ok</span>' :'<span class="orangeMark">fehlgeschlagen</span>');
        $("#ssh").html(lastCheck.sshLogin === "failed" ?'<span class="orangeMark">' + lastCheck.sshLogin + '</span>' :'<span class="blueMark">' + lastCheck.sshLogin +'</span>');
        $("#http").html(lastCheck.httpRequest === "failed" ?'<span class="orangeMark">' + lastCheck.httpRequest + '</span>' :'<span class="blueMark">' + lastCheck.httpRequest + '</span>');
        $("#application").html(lastCheck.applicationState === "conflict" || lastCheck.applicationState === "not enabled" || lastCheck.applicationState === "not running"?'<span class="orangeMark">' + lastCheck.applicationState +'</span>' :'<span class="blueMark">' + lastCheck.applicationState + '</span>');
        $("#baytrail").html(lastCheck.baytrailFreeze === "vulnerable" ?'<span class="orangeMark">' + lastCheck.baytrailFreeze + '</span>' :'<span class="blueMark">' + lastCheck.baytrailFreeze + '</span>');
        $("#bootpartition").html(lastCheck.efiMountOk === "failed" ?'<span class="orangeMark">' + lastCheck.efiMountOk + '</span>' :'<span class="blueMark">' + lastCheck.efiMountOk + '</span>');
        $("#download").html(lastCheck.hasOwnProperty("download") ?lastCheck.download*_KIBIBITTOMBIT < 1.9 ?'<span class="orangeMark">' + (lastCheck.download*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>' :'<span class="blueMark">' + (lastCheck.download*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>' :"-");
        $("#upload").html(lastCheck.hasOwnProperty("upload") ?lastCheck.upload*_KIBIBITTOMBIT < 0.35 ?'<span class="orangeMark">' + (lastCheck.upload*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>' :'<span class="blueMark">' + (lastCheck.upload*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit</span>' :"-");
        $("#applicationuptodate").html(lastCheck.hasOwnProperty("applicationVersion") ?_applicationVersion === lastCheck.applicationVersion ?'<span class="blueMark">' + lastCheck.applicationVersion + '</span>' :'<span title="' + _applicationVersion + '" class="orangeMark">' + lastCheck.applicationVersion + '</span>' :'<span class="blueMark">unsupported</span>');
    } else {
        $("#systemcheck").html('<span class="orangeMark">failed</span>');
        $("#offline").text("-");
        $("#ssd").text("-");
        $("#icmp").text("-");
        $("#ssh").text("-");
        $("#http").text("-");
        $("#application").text("-");
        $("#baytrail").text("-");
        $("#bootpartition").text("-");
        $("#download").text("-");
        $("#upload").text("-");
        $("#applicationuptodate").text("-");
    }
    if (_display.ddbOs)
        $("#sync").text("Wird nicht mehr übertragen");
    else
        $("#sync").text(_display.hasOwnProperty("lastSync") ?formatDate(_display.lastSync) + " (" + _display.lastSync.substring(11, 16) + "h)" :"noch nie");
    $("#lastCheck").text("Letzter Check " + formatDate(lastCheck.timestamp) + " (" + lastCheck.timestamp.substring(11, 16) + " Uhr)");
    $("#pageloader").hide();
}

function setErrorLog(display) {
    display = display[_id];
    let logs = "";
    let errorData = {"offline":[], "ssd":[], "baytrail":[], "icmp":[], "ssh":[], "http":[], "application":[]}; // [{"<days>, <timestamp>}]
    let logsData = [];
    if (display.hasOwnProperty("checkResults") && display.checkResults.length > 0) {
        for (let log of display.checkResults) {
            //console.log(log)
            // offline
            //if (log.hasOwnProperty("offlineSince")) {
            //if (log.sshLogin === "failed" && !log.icmpRequest) {    
            if (!log.online) {
                if (errorData.offline.length === 0)
                    errorData.offline.push({"days":Math.ceil((new Date(log.timestamp) - new Date(log.offlineSince))) === 0 ?1 :Math.ceil((new Date(log.timestamp) - new Date(log.offlineSince)) / 86400000), "timestamp":log.timestamp});
            } else if (errorData.offline.length > 0)
                logsData.push({"title":"Nicht Online", "timestamp":errorData.offline[errorData.offline.length-1].timestamp, "days":errorData.offline.pop().days});
            // ssd
            if (log.smartCheck === "failed") {
                if (errorData.ssd.length === 0)
                    errorData.ssd.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.ssd[errorData.ssd.length-1].days++;
            } else if (errorData.ssd.length > 0)
                logsData.push({"title":"SSD-Karten Fehler", "timestamp":errorData.ssd[errorData.ssd.length-1].timestamp, "days":errorData.ssd.pop().days});
            // baytrail
            if (log.baytrailFreeze === "vulnerable") {
                if (errorData.baytrail.length === 0)
                    errorData.baytrail.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.baytrail[errorData.baytrail.length-1].days++;
            } else if (errorData.baytrail.length > 0)
                logsData.push({"title":"Baytrail Fehler", "timestamp":errorData.baytrail[errorData.baytrail.length-1].timestamp, "days":errorData.baytrail.pop().days});
            // icmp
            if (!log.icmpRequest) {
                if (errorData.icmp.length === 0)
                    errorData.icmp.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.icmp[errorData.icmp.length-1].days++;
            } else if (errorData.icmp.length > 0)
                logsData.push({"title":"ICMP-Request Fehler", "timestamp":errorData.icmp[errorData.icmp.length-1].timestamp, "days":errorData.icmp.pop().days});
            // ssh
            if (log.sshLogin === "failed") {
                if (errorData.ssh.length === 0)
                    errorData.ssh.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.ssh[errorData.ssh.length-1].days++;
            } else if (errorData.ssh.length > 0)
                logsData.push({"title":"SSH Fehler", "timestamp":errorData.ssh[errorData.ssh.length-1].timestamp, "days":errorData.ssh.pop().days});
            // http
            if (log.httpRequest === "failed") {
                if (errorData.http.length === 0)
                    errorData.http.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.http[errorData.http.length-1].days++;
            } else if (errorData.http.length > 0)
                logsData.push({"title":"HTTP-Request Fehler", "timestamp":errorData.http[errorData.http.length-1].timestamp, "days":errorData.http.pop().days});
            // application
            if (log.applicationState === "conflict" || log.applicationState === "not enabled" || log.applicationState === "not running") {
                if (errorData.application.length === 0)
                    errorData.application.push({"days":1, "timestamp":log.timestamp});
                else
                    errorData.application[errorData.application.length-1].days++;
            } else if (errorData.application.length > 0)
                logsData.push({"title":"Application Status Fehler", "timestamp":errorData.application[errorData.application.length-1].timestamp, "days":errorData.application.pop().days});
        }
        if (errorData.offline.length > 0)
            logsData.push({"title":"Nicht Online", "timestamp":errorData.offline[errorData.offline.length-1].timestamp, "days":errorData.offline.pop().days});
        if (errorData.ssd.length > 0)
            logsData.push({"title":"SSD-Karten Fehler", "timestamp":errorData.ssd[errorData.ssd.length-1].timestamp, "days":errorData.ssd.pop().days});
        if (errorData.baytrail.length > 0)
            logsData.push({"title":"Baytrail Fehler", "timestamp":errorData.baytrail[errorData.baytrail.length-1].timestamp, "days":errorData.baytrail.pop().days});
        if (errorData.icmp.length > 0)
            logsData.push({"title":"ICMP-Request Fehler", "timestamp":errorData.icmp[errorData.icmp.length-1].timestamp, "days":errorData.icmp.pop().days});
        if (errorData.ssh.length > 0)
            logsData.push({"title":"SSH Fehler", "timestamp":errorData.ssh[errorData.ssh.length-1].timestamp, "days":errorData.ssh.pop().days});
        if (errorData.http.length > 0)
            logsData.push({"title":"HTTP-Request Fehler", "timestamp":errorData.http[errorData.http.length-1].timestamp, "days":errorData.http.pop().days});
        if (errorData.application.length > 0)
            logsData.push({"title":"Application Status Fehler", "timestamp":errorData.application[errorData.application.length-1].timestamp, "days":errorData.application.pop().days});
        logsData.sort(function(a, b) {
            return compare(a.timestamp, b.timestamp);
        });
        for (let log of logsData) {
            logs += '<tr>' +
                '<td>' + log.title + ' (' + log.days + ' Tag' + (log.days > 1 ?'e' :'') + ')</td>' +
                '<td>' + formatDate(log.timestamp) + '</td>' +
            '</tr>';
        }
    }
    if (!display.hasOwnProperty("pubkey")) {
        logs += '<tr>' +
            '<td>WireGuard pubkey nicht gesetzt</td>' +
            '<td></td>' +
        '</tr>';
    }
    //lastSync
    let daysLastSync = Math.ceil((new Date() - new Date(display.lastSync)) / 86400000);
    if (daysLastSync > 1) {
        logs += '<tr>' +
            '<td>Erfolglose Übertragung (' + daysLastSync + ' Tag' + (daysLastSync > 1 ?'e' :'') + ')</td>' +
            '<td></td>' +
        '</tr>';
    }
    logs = logs === "" ?"<tr><td>Keine Einträge vorhanden</td></tr>" :logs;
    $("#errorlog").html(logs);
}

function setButtons() {
    if (_display !== null && _display.hasOwnProperty("deployment")) {
        $(".btn_displayurl").css("opacity", "1");
        $(".btn_displayurl").attr("title", 'Komplett Löschen, um normalen Betrieb ("Default") wiederherzustellen (Testdisplay, Schwarzbildmodus, Konsole und Heatmap werden deaktiviert)');
        $('.btn_displayurl').click(function(e) {
            $("#displayurlInput").val($("#displayurl").text() === "-" ?"" :$("#displayurl").text());
            if ($("#displayurlfields").is(":visible"))
                $("#displayurlfields").hide();
            else
                $("#displayurlfields").show();
            $("#displayurlInput").focus();
            e.preventDefault();
        });
        $('.btn_savedisplayurl').click(function(e) {
            if (_display !== null) { 
                let displayurl;
                let ddbosparameter = "";
                let input = $("#displayurlInput").val().replace("?ddbos=true", "").replace("&ddbos=true", "").replace("?overwrite=true", "").replace("&overwrite=true", "");
                if (input.trim() == "") {
                    displayurl = getDefaultDisplayURL(_display);
                } else {
                    ddbosparameter = ((input).indexOf("?") == -1 ?"?" :"&") + "ddbos=true&overwrite=true";
                    displayurl = input + ddbosparameter;
                }
                changedisplayurl(displayurl).then((data) => {
                    $("#displayurl").text(displayurl === null ?"-" :displayurl);
                    $("#displayurlfields").hide();
                    $("#pageloader").hide();
                    Swal.fire({
                        title: "URL gespeichert",
                        html: "Erfolgreich übertragen: " + data.success[0] + '<br>Nicht übertragen: ' + (data.failed.hasOwnProperty('offline') ?data.failed.offline :"-"),
                        showCancelButton: false,
                        confirmButtonColor: '#ff821d',
                        iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                        confirmButtonText: 'O.K.',
                        buttonsStyling: true
                    });
                }, () => {
                    $("#displayurl").text(displayurl === null ?"-" :displayurl);
                    $("#displayurlfields").hide();
                });
            }
            e.preventDefault();
        });
        $('.btn_processing').click(function(e) {
            toggleProcessing().then(() => {$("#pageloader").hide()});
            if ($('input[name=Processing]:checked').val() === 'on')
                $(this).attr("title", "Status: Bereit");
            else
                $(this).attr("title", "Status: Befindet sich in Bearbeitung");
                
        });
    } else {
        $(".btn_displayurl").attr("title", "Keine Zuordnung vorhanden");
    }
    if (_display.ddbOs) {
        $('.btn_noice').click(function(e) {
            noice().then(()=>{
                $("#pageloader").hide();
                Swal.fire({
                    title: 'Erfolg',
                    text: "Piep Ton wurde abgespielt.",
                    showCancelButton: false,
                    confirmButtonColor: '#009fe3',
                    iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                    confirmButtonText: 'O.K.',
                    buttonsStyling: true
                });
            });
            e.preventDefault();
        });

        // Heatmap
        if ($("#displayurl").text().indexOf("heatmap=true") != -1) {;
            $("#Heatmap").prop("checked", true);
            $(".btn_heatmap").attr("title", "Heatmap wird gerade angezeigt");
        } else {
            $("#Heatmap").prop("checked", false);
            $(".btn_heatmap").attr("title", "Heatmap wird gerade NICHT angezeigt");
        }
        $('.btn_heatmap').click(function(e) {
            let displayurl = _display.deployment.url.split("&amp;").join("&").replace("?heatmap=true", "").replace("&heatmap=true", "");
            let title;
            if ($('input[name=Heatmap]:checked').val() === 'on') {
                $(this).attr("title", "Wird nicht angezeigt");
                title = "Heatmap gerade wird nicht angezeigt";
            } else {
                displayurl += ((displayurl).indexOf("?") == -1 ?"?" :"&") + "heatmap=true";
                title = "Heatmap gerade angezeigt";
                $(this).attr("title", "Heatmap angezeigt");
            }
            _display.deployment.url = displayurl;
            $("#displayurl").text(displayurl);
            changedisplayurl(displayurl).then((data) => {
                $("#pageloader").hide();
                Swal.fire({
                    title: title,
                    html: "Erfolgreich übertragen: " + data.success[0] + '<br>Nicht übertragen: ' + (data.failed.hasOwnProperty('offline') ?data.failed.offline :"-"),
                    showCancelButton: false,
                    confirmButtonColor: '#ff821d',
                    iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                    confirmButtonText: 'O.K.',
                    buttonsStyling: true
                });
            });
        });

        // Console
        if ($("#displayurl").text().indexOf("console=true") != -1) {;
            $("#Konsole").prop("checked", true);
            $(".btn_console").attr("title", "Konsole wird gerade angezeigt");
        } else {
            $("#Konsole").prop("checked", false);
            $(".btn_console").attr("title", "Konsole wird gerade NICHT angezeigt");
        }
        $('.btn_console').click(function(e) {
            let displayurl = _display.deployment.url.split("&amp;").join("&").replace("?console=true", "").replace("&console=true", "");
            let title;
            if ($('input[name=Konsole]:checked').val() === 'on') {
                $(this).attr("title", "Wird nicht angezeigt");
                title = "Konsole gerade wird nicht angezeigt";
            } else {
                displayurl += ((displayurl).indexOf("?") == -1 ?"?" :"&") + "console=true";
                title = "Konsole gerade angezeigt";
                $(this).attr("title", "Konsole angezeigt");
            }
            _display.deployment.url = displayurl;
            $("#displayurl").text(displayurl);
            changedisplayurl(displayurl).then((data) => {
                $("#pageloader").hide();
                Swal.fire({
                    title: title,
                    html: "Erfolgreich übertragen: " + data.success[0] + '<br>Nicht übertragen: ' + (data.failed.hasOwnProperty('offline') ?data.failed.offline :"-"),
                    showCancelButton: false,
                    confirmButtonColor: '#ff821d',
                    iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                    confirmButtonText: 'O.K.',
                    buttonsStyling: true
                });
            });
        });

        $('.btn_restartApplication').click(function(e) {
            restartDDBOS().then(()=>{$("#pageloader").hide()});
            e.preventDefault();
        });
        $('.btn_restart').click(function(e) {
            Swal.fire({
                title: 'Sind Sie sicher?',
                text: "Wollen Sie das System neustarten?",
                showCancelButton: true,
                confirmButtonColor: '#009fe3',
                cancelButtonColor: '#ff821d',
                iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                confirmButtonText: 'Ja, neustarten!',
                cancelButtonText: 'Vorgang abbrechen!',
                buttonsStyling: true
            }).then(function(selection) {
                if (selection.isConfirmed === true)
                    restart().then(()=>{$("#pageloader").hide()});
            })
            e.preventDefault();
        });
        $('.btn_screenshot').click(function(e) {
            if (_display !== null && _display.hasOwnProperty("checkResults") && _display.checkResults.length > 0 && _display.checkResults[0].hasOwnProperty("offlineSince")) {
                Swal.fire({
                    title: 'System war offline',
                    text: "Dieses System wurde beim letzten Check 'offline' gemessen. Ein Screenshot kann aufgrund fehlender Erreichbarkeit unerwartet lange dauern.",
                    showCancelButton: true,
                    confirmButtonColor: '#009fe3',
                    cancelButtonColor: '#ff821d',
                    iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                    confirmButtonText: 'Fortsetzen!',
                    cancelButtonText: 'Abbrechen',
                    buttonsStyling: true
                }).then(function(selection) {
                    if (selection.isConfirmed === true)
                        window.open('https://sysmon.homeinfo.de/screenshot/' + _id, "_blank"); // http://321.terminals.homeinfo.intra:8000/screenshot (faster)
                });
            } else
                window.open('https://sysmon.homeinfo.de/screenshot/' + _id, "_blank"); // http://321.terminals.homeinfo.intra:8000/screenshot (faster)
            
            e.preventDefault();
        });
        $('.btn_eye').click(function(e) {
            if (_display.deployment.hasOwnProperty("url"))
                window.open(_display.deployment.url.split("&amp;").join("&"), '_blank');
        });
        $('#noiceLine').show();
        $('#restartLine').show();
        $('#restartDDBOSLine').show();
        $('#screenshotLine').show();
        $('#heatmapMode').show();
        $('#consoleMode').show();
    } else if (_display.operatingSystem === "Arch Linux") {
        $('.btn_noice').click(function(e) {
            noice().then(()=>{
                $("#pageloader").hide();
                Swal.fire({
                    title: 'Erfolg',
                    text: "Piep Ton wurde abgespielt.",
                    showCancelButton: false,
                    confirmButtonColor: '#009fe3',
                    iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                    confirmButtonText: 'O.K.',
                    buttonsStyling: true
                });
            });
            e.preventDefault();
        }); 
        $('.btn_restart').click(function(e) {
            Swal.fire({
                title: 'Sind Sie sicher?',
                text: "Wollen Sie das System neustarten?",
                showCancelButton: true,
                confirmButtonColor: '#009fe3',
                cancelButtonColor: '#ff821d',
                iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                confirmButtonText: 'Ja, neustarten!',
                cancelButtonText: 'Vorgang abbrechen!',
                buttonsStyling: true
            }).then(function(selection) {
                if (selection.isConfirmed === true)
                    restart().then(()=>{$("#pageloader").hide()});
            })
            e.preventDefault();
        });
        $('.btn_screenshot').click(function(e) {
            if (_display !== null && _display.hasOwnProperty("checkResults") && _display.checkResults.length > 0 && _display.checkResults[0].hasOwnProperty("offlineSince")) {
                Swal.fire({
                    title: 'System war offline',
                    text: "Dieses System wurde beim letzten Check 'offline' gemessen. Ein Screenshot kann aufgrund fehlender Erreichbarkeit unerwartet lange dauern.",
                    showCancelButton: true,
                    confirmButtonColor: '#009fe3',
                    cancelButtonColor: '#ff821d',
                    iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                    confirmButtonText: 'Fortsetzen!',
                    cancelButtonText: 'Abbrechen',
                    buttonsStyling: true
                }).then(function(selection) {
                    if (selection.isConfirmed === true)
                        window.open('https://sysmon.homeinfo.de/screenshot/' + _id, "_blank"); // http://321.terminals.homeinfo.intra:8000/screenshot (faster)
                });
            } else
                window.open('https://sysmon.homeinfo.de/screenshot/' + _id, "_blank"); // http://321.terminals.homeinfo.intra:8000/screenshot (faster)
            
            e.preventDefault();
        });
        $('.btn_eye').click(function(e) {
            $("#pageloader").show();
            $.ajax({
                url: "https://sysmon.homeinfo.de/preview/" + _display.deployment.id,
                type: "GET",
                contentType: 'application/json',
                success: function (msg) {
                    window.open('https://cms.homeinfo.de/preview/preview.html?token=' + msg.token, '_blank');
                    $("#pageloader").hide();
                },
                error: function (msg) {
                    setErrorMessage(msg, "Generieren der Vorschau");
                }
            });
        });
        $('.btn_sync').click(function(e) {
            if (_display !== null && _display.hasOwnProperty("deployment"))
                sync().then(()=>{$("#pageloader").hide()});
            e.preventDefault();
        });
        $(".fa-chess-board").css("opacity", "0.3");
        $(".fa-chess-board").attr("title", "Steht für dieses System nicht zur Verfügung");
        $('#noiceLine').show();
        $('#restartLine').show();
        $('#screenshotLine').show();
        $('#syncLine').show();
    } else {
        $('.btn_eye').click(function(e) {
            $("#pageloader").show();
            $.ajax({
                url: "https://sysmon.homeinfo.de/preview/" + _display.deployment.id,
                type: "GET",
                contentType: 'application/json',
                success: function (msg) {
                    window.open('https://cms.homeinfo.de/preview/preview.html?token=' + msg.token, '_blank');
                    $("#pageloader").hide();
                },
                error: function (msg) {
                    setErrorMessage(msg, "Generieren der Vorschau");
                }
            });
        });
        $('.btn_sync').click(function(e) {
            if (_display !== null && _display.hasOwnProperty("deployment"))
                sync().then(()=>{$("#pageloader").hide()});
            e.preventDefault();
        });
        $('#syncLine').show();
    }
}
function setHistory(history, page = 1) {
    if (_deploymentHistory === null) {
        _deploymentHistory = [];
        const chunkSize = 10;
        for (let i = 0; i < history.length; i += chunkSize)
            _deploymentHistory.push(history.slice(i, i + chunkSize));
    }
    let historyEntries = "";
    if (_deploymentHistory.length > 0) {
        for (let entry of _deploymentHistory[page-1]) {
            historyEntries += "<tr>" +
                "<td>" + (entry.account.hasOwnProperty("fullName") ?entry.account.fullName :entry.account.name) + "</td>" +
                "<td>Zuordnung: " + (entry.oldDeployment === null ?"keine" :entry.oldDeployment) + "</td>" + // "k.Z." -> " "keine Zuordnung"
                "<td>" + formatDate(entry.timestamp) + " (" + entry.timestamp.substring(11, 16) + "Uhr)</td>" +
            "</tr>";
        }
    }
    historyEntries = historyEntries === "" ?"<tr><td>Keine Einträge vorhanden.</td></tr>" :historyEntries;
    $("#history").html(historyEntries);

    if (_deploymentHistory !== null && _deploymentHistory.length > 1)
        $("#system-pages").show();
    else
        $("#system-pages").hide();
    $("#system-pages").html('<span class="previousPage pointer" data-page="' + page + '"><u><<</u></span> ' + page + ' / ' + _deploymentHistory.length + ' <span class="nextPage pointer" data-page="' + page + '"><u>>></u>');
    $('.nextPage').click(function(e) {
        if (_deploymentHistory !== null) {
            if (parseInt($(this).data("page"))+1 > _deploymentHistory.length)
                setHistory(null, 1);
            else             
                setHistory(null, parseInt($(this).data("page")) + 1);
        }
    });
    $('.previousPage').click(function(e) {
        if (_deploymentHistory !== null) {
            if (parseInt($(this).data("page"))-1 < 1)
                setHistory(null, _deploymentHistory.length);
            else             
                setHistory(null, parseInt($(this).data("page")) - 1);
        }
    });
}
function denyHistory() {
    $("#history").html("<tr><td>History nicht vorhanden</td></tr>");
}
function getDeploymentHistory() {
    return $.ajax({
        url: "https://termgr.homeinfo.de/deployment-history/" + _id,
        type: "GET",
        cache: false,
        success: function (data) {  },
        error: function (msg) {
            if (msg.responseText !== "No such system.")
                setErrorMessage(msg, "Anzeigen der History");
        }
    });
}

// Systemchecks über 30 Tage
function setThirtyDays(data) {
    _display = data[_id];
    let date = new Date();
    let dateDay;
    let dateFound;
    let timestamp;
    let title;
    $("#thirtysystemcheck").html('');
    $("#thirtyoffline").html('');
    $("#thirtyicmp").html('');
    $("#thirtyssh").html('');
    $("#thirtyhttp").html('');
    $("#thirtydownloadupload").html('');
    for (let day = 0; day < 30; day++) {
        dateFound = false;
        dateDay = (date.getDate() < 10 ?"0" + date.getDate(): date.getDate()) + "." + (date.getMonth() < 9 ?"0" + (date.getMonth()+1) :date.getMonth()+1) + "." + date.getFullYear();
        if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > day) {
            for (let log of _display.checkResults) {
                timestamp = new Date(log.timestamp);
                if (date.getFullYear() === timestamp.getFullYear() && date.getMonth() === timestamp.getMonth() && date.getDate() === timestamp.getDate()) {
                    dateFound = true;
                    $("#thirtysystemcheck").append('<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    //$("#thirtyoffline").append(log.hasOwnProperty("offlineSince") || log.sshLogin !== "success" ?'<li data-toggle="tooltip" title="' + dateDay + '" class="orangeSq"></li>' :'<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    //$("#thirtyoffline").append(log.sshLogin === "failed" && !log.icmpRequest ?'<li data-toggle="tooltip" title="' + dateDay + '" class="orangeSq"></li>' :'<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    $("#thirtyoffline").append(!log.online ?'<li data-toggle="tooltip" title="' + dateDay + '" class="orangeSq"></li>' :'<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    $("#thirtyicmp").append(!log.icmpRequest ?'<li data-toggle="tooltip" title="' + dateDay + '" class="orangeSq"></li>' :'<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    $("#thirtyssh").append(log.sshLogin === "failed" ?'<li data-toggle="tooltip" title="' + dateDay + '" class="orangeSq"></li>' :'<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    $("#thirtyhttp").append(log.httpRequest === "failed" ?'<li data-toggle="tooltip" title="' + dateDay + '" class="orangeSq"></li>' :'<li data-toggle="tooltip" title="' + dateDay + '"></li>');
                    title = dateDay + '<br>' + (log.hasOwnProperty("download")?(log.download*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit':"-") + '<br>' + (log.hasOwnProperty("upload") ?(log.upload*_KIBIBITTOMBIT).toFixed(2).split(".").join(",") + ' Mbit' :'-')
                    $("#thirtydownloadupload").append((log.hasOwnProperty("download") && log.download*_KIBIBITTOMBIT < 1.9) || (log.hasOwnProperty("upload") && log.upload*_KIBIBITTOMBIT < 0.35)?'<li data-toggle="tooltip" title="' + title + '" class="orangeSq"></li>' :'<li data-toggle="tooltip" title="' + title + '"></li>');
                    break;
                }
            }
        }
        if (!dateFound) {
            $("#thirtysystemcheck").append('<li data-toggle="tooltip" title="' + dateDay + ': Kein Check durchgeführt" class="orangeSq"></li>');
            $('#thirtyoffline').append('<li data-toggle="tooltip" title="' + dateDay + ': Keine Daten vorhanden" style="height:5px; margin-top:18px"></li>');
            $('#thirtyicmp').append('<li data-toggle="tooltip" title="' + dateDay + ': Keine Daten vorhanden" style="height:5px; margin-top:18px"></li>');
            $('#thirtyssh').append('<li data-toggle="tooltip" title="' + dateDay + ': Keine Daten vorhanden" style="height:5px; margin-top:18px"></li>');
            $('#thirtyhttp').append('<li data-toggle="tooltip" title="' + dateDay + ': Keine Daten vorhanden" style="height:5px; margin-top:18px"></li>');
            $('#thirtydownloadupload').append('<li data-toggle="tooltip" title="' + dateDay + ': Keine Daten vorhanden" style="height:5px; margin-top:18px"></li>');
        }
        date.setDate(date.getDate()-1);
    };
    if (_display.hasOwnProperty("checkResults") && _display.checkResults.length > 0 && _display.checkResults[0].httpRequest !== "unsupported")
        $(".thirtyhttp").show();
    else
        $(".thirtyhttp").hide();
        
    $("#thirtyloading").hide();
    $('[data-toggle="tooltip"]').tooltip({html:true});
    $("#thirty").show();
}

function getSystem() {
    return $.ajax({
        url: "https://termgr.homeinfo.de/list/systems/" + _id,
        type: "GET",
        cache: false,
        error: function (msg) {
            setErrorMessage(msg, "Anzeigen des Systems");
        }
    });
}
function checkSystem() {
    $("#pageloader").show();
    return $.ajax({
        url: "https://sysmon.homeinfo.de/check/" + _id,
        type: "GET",
        cache: false,
        error: function (msg) {
            setErrorMessage(msg, "Checken des Systems");
        }
    });
}
function getSystemInfo() {
    return $.ajax({
        url: "https://sysmon.homeinfo.de/sysinfo/" + _id,
        type: "GET",
        cache: false,
        error: function (msg) {
            console.log(msg)
            //setErrorMessage(msg, "Laden der Systeminfos");
        }
    });
}
function setSystemysinfo(data) {
    if (data.hasOwnProperty("df")) {
        for (let systemdata of data.df) {
            if (systemdata.filesystem == "/dev/sda2") {
                $('#hddavailable').text(Math.floor(systemdata.available/1024).toLocaleString() + " MB");
                break;
            } else if (systemdata.filesystem == "ext4") {
                $('#hddavailable').text(Math.floor(systemdata.available/1024/1024).toLocaleString() + " MB");
                break;
            }
        }
    }
}
                                
function listDeployments(deployments = null) {
    if (deployments !== null) {
        _deployments = deployments;
        _deployments.sort(function(a, b) {
            //return a.systems.length > 0 ?1 :b.systems.length > 0 ?-1 :0;
            return compare(a.address.street, b.address.street);
        });
    };
    if (_deployments !== null) {
        let deploymentList = "";
        let address;
        for (let item in _deployments) {
            address = _deployments[item].hasOwnProperty("address") ?_deployments[item].address.street + " " + _deployments[item].address.houseNumber + ", " + _deployments[item].address.zipCode + " " + _deployments[item].address.city :'<i>Keine Adresse angegeben</i>';
            if (address.toLowerCase().indexOf($('#deploymentsearch').val().toLowerCase()) !== -1 || _deployments[item].customer.id.toString().indexOf($('#deploymentsearch').val()) !== -1 || (_deployments[item].customer.hasOwnProperty("abbreviation") && _deployments[item].customer.abbreviation.toString().toLowerCase().indexOf($('#deploymentsearch').val()) !== -1) || _deployments[item].customer.company.name.toString().toLowerCase().indexOf($('#deploymentsearch').val()) !== -1 || _deployments[item].id.toString().indexOf($('#deploymentsearch').val()) !== -1) 
                deploymentList += '<li><a class="dropdown-item btn_addDeployment" data-id="' + item + '" title="' + _deployments[item].id + '"href="#">' + address + ' (' + _deployments[item].systems.length + ')</a></li>';
        }
        $('.btn_addDeployment').parent().remove();
        $("#deploymentsDropdown").append(deploymentList);
        $('.btn_addDeployment').click(function(e) {
            localStorage.removeItem("servicetool.systemchecks");
            let id = $(this).data("id");
            let address = _deployments[id].hasOwnProperty("address") ?_deployments[id].address.street + " " + _deployments[id].address.houseNumber + ", " + _deployments[id].address.zipCode + " " + _deployments[id].address.city :'<i>Keine Adresse angegeben</i>';
            if (_deployments[id].systems.length > 0) {
                Swal.fire({
                    title: 'Der Standort: <i>"' + address + '"</i> wird bereits ' + _deployments[id].systems.length + 'mal genutzt',
                    text: "Was wollen Sie machen?",
                    showDenyButton: true,
                    denyButtonText: _deployments[id].systems.length === 1 ?"Anderen Standort lösen!" :"ALLE anderen Standorte lösen!!",
                    denyButtonColor: '#009fe3',
                    showCancelButton: true,
                    confirmButtonColor: '#009fe3',
                    cancelButtonColor: '#ff821d',
                    iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                    confirmButtonText: 'Zusätzlich zuweisen!',
                    cancelButtonText: 'Vorgang abbrechen!',
                    buttonsStyling: true
                }).then(function(selection) {
                    if (selection.isConfirmed === true) {
                        _systemChecksPromise = []; // in common
                        $("#deploymentsDropdown").removeClass("show");
                        setDeployments(_id, _deployments[id].id).then(()=>{
                            Promise.all(getListOfSystemChecks()).then((data)=> {
                                systemCheckCompleted(data);
                                if (_display.ddbOs) {
                                    //let displayurl = _deployments[id].hasOwnProperty('url') ?_deployments[id].url.split("&amp;").join("&").replace("?blackmode=true", "").replace("&blackmode=true", "").replace("?displaytest=true", "").replace("&displaytest=true", "").replace("?overwrite=true", "").replace("&overwrite=true", "") :getDefaultDisplayURL(_display);
                                    let displayurl = getDefaultDisplayURL(_display);
                                    changedisplayurl(displayurl).then((data) => {
                                        $("#pageloader").hide();
                                        Swal.fire({
                                            title: "URL übertragen",
                                            html: "Erfolgreich übertragen: " + data.success[0] + '<br>Nicht übertragen: ' + (data.failed.hasOwnProperty('offline') ?data.failed.offline :"-"),
                                            showCancelButton: false,
                                            confirmButtonColor: '#ff821d',
                                            iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                                            confirmButtonText: 'O.K.',
                                            buttonsStyling: true
                                        });
                                    });
                                }
                            })
                        });
                    } else if (selection.isDenied === true) {
                        $("#deploymentsDropdown").removeClass("show");
                        let promises = [];
                        let alreadyDeployed = false;
                        for (let system of _deployments[id].systems) {
                            if (system == _id)
                                alreadyDeployed = true;
                            else
                                promises.push (setDeployments(system));
                        }
                        if (!alreadyDeployed)
                            promises.push(setDeployments(_id, _deployments[id].id));
                        _systemChecksPromise = []; // in common
                        Promise.all(getListOfSystemChecks()).then((data)=> {
                            systemCheckCompleted(data);
                            if (_display.ddbOs) {
                                //let displayurl = _deployments[id].hasOwnProperty('url') ?_deployments[id].url.split("&amp;").join("&").replace("?blackmode=true", "").replace("&blackmode=true", "").replace("?displaytest=true", "").replace("&displaytest=true", "").replace("?overwrite=true", "").replace("&overwrite=true", "") :getDefaultDisplayURL(_display);
                                let displayurl = getDefaultDisplayURL(_display);
                                changedisplayurl(displayurl).then((data) => {
                                    $("#pageloader").hide();
                                    Swal.fire({
                                        title: "URL übertragen",
                                        html: "Erfolgreich übertragen: " + data.success[0] + '<br>Nicht übertragen: ' + (data.failed.hasOwnProperty('offline') ?data.failed.offline :"-"),
                                        showCancelButton: false,
                                        confirmButtonColor: '#ff821d',
                                        iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                                        confirmButtonText: 'O.K.',
                                        buttonsStyling: true
                                    });
                                });
                            }
                        });
                            
                    }
                });
            } else {
                $("#deploymentsDropdown").removeClass("show");
                _systemChecksPromise = []; // in common
                setDeployments(_id, _deployments[id].id).then(()=> {
                    Promise.all(getListOfSystemChecks()).then((data)=> {
                        systemCheckCompleted(data);
                        if (_display.ddbOs) {
                            let displayurl = getDefaultDisplayURL(_display);
                            changedisplayurl(displayurl).then((data) => {
                                $("#pageloader").hide();
                                Swal.fire({
                                    title: "URL übertragen",
                                    html: "Erfolgreich übertragen: " + data.success[0] + '<br>Nicht übertragen: ' + (data.failed.hasOwnProperty('offline') ?data.failed.offline :"-"),
                                    showCancelButton: false,
                                    confirmButtonColor: '#ff821d',
                                    iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                                    confirmButtonText: 'O.K.',
                                    buttonsStyling: true
                                });
                            });
                        }
                    });
                });  
            }
            e.preventDefault();
        });
        $("#deploymentsDropdown").addClass("show");
        $('#deploymentsearch').focus();
        $("#pageloader").hide();
    }
}
function setDeployments(id, deployment = null, exclusive = false) {
    $("#pageloader").show();
    localStorage.removeItem("servicetool.systems");
    const data = {
        'system': id,
        'deployment':deployment,
        'exclusive': exclusive
    };
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/deploy',
        type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data) {  },
        error: function (msg) {
            setErrorMessage(msg, "Zuweisen/Lösen des Standortes");
        }
    });
}
function sync() {
    $("#pageloader").show();
    localStorage.removeItem("servicetool.systems");
    localStorage.removeItem("servicetool.systemchecks");
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/sync', //"https://hipster.homeinfo.de?customer=" + _display.deployment.customer.id,
        type: "POST",
        data: JSON.stringify({'system': _id}),
        contentType: 'application/json',
        success: function (queue) { },
        error: function (msg) {
            setErrorMessage(msg, "Durchführen der Synchronisation");
        }
    });
}
function noice() {
    $("#pageloader").show();
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/beep',
        type: "POST",
        data: JSON.stringify({'system': _id}),
        contentType: 'application/json',
        error: function (msg) {
            setErrorMessage(msg, "Piepen des Systems");
        }
    });
}
function restart() {
    $("#pageloader").show();
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/reboot',
        type: "POST",
        data: JSON.stringify({'system': _id}),
        contentType: 'application/json',
        error: function (msg) {
            setErrorMessage(msg, "Neustarten des Systems");
        }
    });
}
function restartDDBOS() {
    $("#pageloader").show();
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/restart-web-browser',
        type: "POST",
        data: JSON.stringify({'system': _id}),
        contentType: 'application/json',
        error: function (msg) {
            setErrorMessage(msg, "Neustarten des Browsers");
        }
    });
}
function setFit() {
    $("#pageloader").show();
    localStorage.removeItem("servicetool.systems");
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/fit',
        type: "POST",
        data: JSON.stringify({'system': _id, 'fitted': $('input[name=Verbaut]:checked').val() !== 'on'}),
        contentType: 'application/json',
        error: function (msg) {
            setErrorMessage(msg, 'Systems als "verbaut" zu markieren');
        }
    });  
}
function setApplicationState() {
    $("#pageloader").show();
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/application',
        type: "POST",
        data: JSON.stringify({'system': _id, 'mode': $('input[name=display-mode]:checked').val()}),
        contentType: 'application/json'
    });  
}
function setPublicTransport(address) {
    $("#pageloader").show();
    localStorage.removeItem("servicetool.systems");
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/lpt-address/' + _display.deployment.id,
        type: "POST",
        data: JSON.stringify(address),
        contentType: 'application/json',
        error: function (msg) {
            setErrorMessage(msg, "Durchführen der ÖPNV-Änderung");
        }
    });
}

function changeSerialNumber(serialNumber) {
    $("#pageloader").show();
	let data = {"system":_display.id, "serialNumber":serialNumber};
	return $.ajax({
		url: "https://termgr.homeinfo.de/administer/serial-number",
		type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json',
		error: function (msg) {
			setErrorMessage(msg, "Ändern eines Deployments");
		}
	});   
}
function changeOs(ddbos = true) {
    $("#pageloader").show();
	let data = {"system":_display.id, "ddbOs":ddbos};
	return $.ajax({
		url: "https://termgr.homeinfo.de/administer/ddbos",
		type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json',
		error: function (msg) {
			setErrorMessage(msg, "Ändern des Bestriebssystems");
		}
	});   
}
function changeWarranty(warranty) {
    $("#pageloader").show();
	let data = {"system":_display.id, "warranty":warranty};
	return $.ajax({
		url: "https://termgr.homeinfo.de/administer/warranty",
		type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json',
		error: function (msg) {
			setErrorMessage(msg, "Ändern der Garantie");
		}
	});   
}

function changedisplayurl(displayurl, save = true) {
    $("#pageloader").show();
    let url;
    if (save)
        url = "https://termgr.homeinfo.de/administer/url/" + _display.deployment.id;
    else
        url = "https://termgr.homeinfo.de/administer/send-url/" + _display.id,
    localStorage.removeItem("servicetool.systems");
    //localStorage.removeItem("servicetool.systemchecks");
	let data = {"url":displayurl};
	return $.ajax({
		url: url,
		type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json',
		error: function (msg) {
			setErrorMessage(msg, "Senden der URL");
		}
	});   
}

function saveTechnicianAnnotation(id, annotation) {
    $("#pageloader").show();
    localStorage.removeItem("servicetool.systems");
    return $.ajax({
        url: 'https://backend.homeinfo.de/deployments/' + id + "/annotation",
        method: 'PATCH',
        contentType: 'application/json',
        data: JSON.stringify(annotation),
        dataType: 'json',
		error: function (msg) {
			console.log(msg)
		},
        xhrFields: {
            withCredentials: true
        }
    });
}

function setTesting(testing) {
    $("#pageloader").show();
	let data = {"system":_display.id, "testing":testing};
    return $.ajax({
        type: 'POST',
        url: 'https://termgr.homeinfo.de/administer/testing',
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: 'json'
    });
}

function toggleProcessing() {
    $("#pageloader").show();
    localStorage.removeItem("servicetool.systemchecks");
	let data = {"system":_display.id, "processing":$('input[name=Processing]:checked').val() == 'on' ?0 :1};
    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/processing',
        type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json'
    });
}


/*
class ApplicationState(str, Enum):
    AIR = 'air'
    HTML = 'html'
    CONFLICT = 'conflict'
    NOT_ENABLED = 'not enabled'
    NOT_RUNNING = 'not running'
    UNKNOWN = 'unknown'
class BaytrailFreezeState(str, Enum):
    NOT_AFFECTED = 'not affected'
    MITIGATED = 'mitigated'
    VULNERABLE = 'vulnerable'
    UNKNOWN = 'unknown'
class State(str, Enum):
    RECOVERED = 'recovered'
    FAILED = 'failed'
    UNCHANGED = 'unchanged'
class SuccessFailedUnsupported(str, Enum):
    SUCCESS = 'success'
    FAILED = 'failed'
    UNSUPPORTED = 'unsupported'
*/