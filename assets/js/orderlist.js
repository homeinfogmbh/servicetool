$(document).ready(function() {
    getOrderings().then(setOrderings);
    $("#pageloader").hide();
});

function setOrderings(orderings) {
    console.log(orderings)
    let orderingsDom = "";
    let address;
    for (let order of orderings) {
        address = order.street + " " + order.houseNumber + ", " + order.zipCode + " " + order.city
        orderingsDom += '<tr>' +
            '<td>' + order.customer.abbreviation + '</td>' +
            '<td title="' + address + '">' + address.substring(0, 12) + (address.length > 13 ? '...' :'') +  '</td>' +
            '<td><span class="Einge ' + (isOnDate(order.issued, 168) ?"" :"EingeActive") + '">' + formatDate(order.issued) + '</span></td>' +
            '<td>' +
                '<ul class="Umgebung">' +
                    (order.hasOwnProperty('installationDateConfirmed') ?'<li class="active"></li>' :'<li></li>') + 
                    (order.hasOwnProperty('constructionSitePreparationFeedback') ?'<li class="active"></li>' :'<li></li>') + 
                    (order.hasOwnProperty('internetConnection') ?'<li class="active"></li>' :'<li></li>') + 
                    (order.hasOwnProperty('hardwareInstallation')?'<li class="active"></li>' :'<li></li>') + 
                '</ul>' +
            '</td>' +
            '<td><a href="bestelltool.html?id=' + order.id + '" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>' +
        '</tr>';
    }
    $("#registrations").html(orderingsDom);
}

function getOrderings() {
	return $.ajax({
		url: "https://ddborder.homeinfo.de/order",
		type: "GET",
		success: function (msg) {
		},
		error: function (msg) {
			setErrorMessage(msg, "Abrufen der Bestellungen"); // Called in default
		}
	});
}