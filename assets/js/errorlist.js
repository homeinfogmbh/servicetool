var _list = null;
var _type;
var _typeDefinitions = {'ssdcarderror':{'title':'SSD Karten Fehler', 'text':'Liste der Geräte die einen SSD-Karten-Fehler vorweisen'},
    'notfitted':{'title':'Nicht verbaute Systeme', 'text':'Liste der Geräte die nicht verbaut sind'},
    'testsystem':{'title':'Testgeräte', 'text':'Liste der Testgeräte'},
    'offline':{'title':'Offline', 'text':'Liste der Geräte die offline sein'},
    'noActualData':{'title':'Keine aktuellen Daten', 'text':'Liste der Geräte die keine aktuellen Daten besitzen'},
    'blackscreen':{'title':'Im Schwarz-Bildmodus', 'text':'Liste der Geräte die schwarz geschaltet sind'},
    'oldApplication':{'title':'Alte Applicationen', 'text':'Liste der Geräte auf denen eine alte Version der Applikation läuft'},
    'system':{'title':'Systeme', 'text':'Liste aller Systeme'},
};
$(document).ready(function() {
    _type = _typeDefinitions.hasOwnProperty(getURLParameterByName('type')) ?getURLParameterByName('type') :'system';
    getListOfSystemChecks().then(setList);
    //$(".dashTopLeft").html('<h2>Listenansicht</h2><p>Liste der Geräte deren Betriebssystem veraltet ist</p>');
    $(".dashTopLeft").html('<h2>' + _typeDefinitions[_type].title + '</h2><p>' + _typeDefinitions[_type].text + '</p>');
	$('#searchfield').on('input',function(e) {
		setList();
	});	
});

function setList(list = null) {
    if (list !== null) {
        _list = $.map(list, function(value, index){
            return [value];
        });
        for (let check of _list) {
            if (!check.hasOwnProperty("deployment"))
                check.deployment = {"customer":{"id":-1, "company": {"abbreviation": "Zzuordnung nicht vorhanden"}}};
        }
        _list.sort(function(a, b) {
            return compare(a.deployment.customer.company.abbreviation.toLowerCase(), b.deployment.customer.company.abbreviation.toLowerCase());
        });
        console.log(_list);
    }
    let counter = 0;
    //if ($(".system").length > 0) {
    if (false) { 
        $('.system').hide();
        for (let check of _list) {
            if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("offlineSince")) {
                if ($('#searchfield').val().length === 0 || (check.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1 || (check.deployment.hasOwnProperty('address') ?check.deployment.address.street + ' ' + check.deployment.address.houseNumber + ' ' + check.deployment.address.zipCode + ' ' + check.deployment.address.city :'Nicht angegeben').toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.company.abbreviation.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || (check.deployment.customer.company.hasOwnProperty("name") ?check.deployment.customer.company.name :"").toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1)) {
                    $('.system[data-id="' + check.id + '"]').show();
                    counter++;
                }
            }
        }
    } else {
        let systemlistDOM = "";
        let address;
        let adressComplete;
        for (let check of _list) {
            if (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("offlineSince")) {
                if ($('#searchfield').val().length === 0 || (check.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1 || (check.deployment.hasOwnProperty('address') ?check.deployment.address.street + ' ' + check.deployment.address.houseNumber + ' ' + check.deployment.address.zipCode + ' ' + check.deployment.address.city :'Nicht angegeben').toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.company.abbreviation.toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || (check.deployment.customer.company.hasOwnProperty("name") ?check.deployment.customer.company.name :"").toLowerCase().indexOf($('#searchfield').val().toLowerCase()) !== -1 || check.deployment.customer.id.toString().indexOf($('#searchfield').val().toLowerCase()) !== -1)) {
                    adressComplete = check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber + " " + check.deployment.address.zipCode + " " + check.deployment.address.city :'';
                    address = check.deployment.hasOwnProperty("address") ?check.deployment.address.street + " " + check.deployment.address.houseNumber :'';
                    systemlistDOM += '<tr class="system" data-id="' + check.id + '">' +
                        '<td title="System-ID: ' + check.id  + '">' + (check.deployment.customer.company.abbreviation === "Zuordnung nicht vorhanden" ?'<i>' + check.deployment.customer.company.abbreviation + '</i>' :check.deployment.customer.company.abbreviation) + '</td>' +
                        '<td title="' + adressComplete + '">' + address +  '</td>' + //'<td title="' + address + '">' + address.substring(0, 12) + (address != '' ?'...' :'') +  '</td>' +
                        '<td><span class="' + (check.hasOwnProperty("checkResults") && check.checkResults.length > 0 && check.checkResults[0].hasOwnProperty("offlineSince") ?'orangeCircle' :'blueCircle') + '"></span></td>' +
                        '<td><span class="blueCircle"></span></td>' +
                        '<td><span class="blueCircle"></span></td>' +
                        '<td><span class="blueCircle"></span></td>' +
                        '<td><span class="blueCircle"></span></td>' +
                        '<td><span class="blueCircle"></span></td>' +
                        '<td><span class="blueCircle"></span></td>' +
                        '<td><span class="blueCircle"></span></td>' +
                        '<td>' + (check.hasOwnProperty("lastSync") ?formatDate(check.lastSync) + " " + check.lastSync.substring(11, 16): "nie") + '</td>' +
                        '<td><a href="display-details.html?id=' + check.id + '" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>' +
                    '</tr>';
                    counter++;
                }
            }
        }
        systemlistDOM = systemlistDOM === "" ?"<tr><td>Keine Einträge vorhanden</td></tr>" :systemlistDOM;
        $("#systemlist").html(systemlistDOM);
    }
    $(".dashTopLeft").html('<h2>' + _typeDefinitions[_type].title + ' (' + counter + ')</h2><p>' + _typeDefinitions[_type].text + '</p>');
    $("#pageloader").hide();
}