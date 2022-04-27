var _display = null;
$(document).ready(function() {
    getListOfSystemChecks().then(setDetails);
    $('.editAddress').click(function(e) {
		console.log("TODO")
		e.preventDefault();
	});
});

function setDetails(list) {
    let id = getURLParameterByName('id');
    
    for (let check in list) {
        if (parseInt(id) === list[check].id) {
            _display = list[check];
            break;
        }
    }
    if (_display.hasOwnProperty("checkResults")) {
        _display.checkResults.sort(function(a, b) {
            return compareInverted(a.timestamp, b.timestamp);
        });
    }

    let address = _display.hasOwnProperty("deployment") ?_display.deployment.hasOwnProperty("address") ?_display.deployment.address.street + " " + _display.deployment.address.houseNumber + " " + _display.deployment.address.zipCode + " " + _display.deployment.address.city :'<i>Keine Adresse angegeben</i>' :'<i>Keinen Standort zugewiesen</i>';
    $("#displaytitle").html("Display: " + address);
    $("#pageloader").hide();
}