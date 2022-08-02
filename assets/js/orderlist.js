$(document).ready(function() {
    getDeployments().then(setDeployments);
});

function setDeployments(deployments) {
    let orderingsDom = "";
    let address;
    for (let deployment of deployments) {
       if (!deployment.hasOwnProperty("constructionSitePreparationFeedback") || !deployment.hasOwnProperty("internetConnection")) {
            address = deployment.hasOwnProperty("address") ?deployment.address.street + " " + deployment.address.houseNumber + ", " + deployment.address.zipCode + " " + deployment.address.city :'<i>Keine Adresse angegeben</i>';
            orderingsDom += '<tr>' +
                '<td title=' + deployment.id + '>' + deployment.customer.abbreviation + '</td>' +
                '<td title="' + address + '">' + address.substring(0, 12) + (address.length > 13 ? '...' :'') +  '</td>' +
                '<td>' + deployment.type + '</td>' +
                '<td>' + (deployment.hasOwnProperty("created") ?formatDate(deployment.created) :"-") + '</td>' +
                '<td>' +
                    '<input type="checkbox" style="display: none;" name="BaustelleOK' + deployment.id + '" id="BaustelleOK' + deployment.id + '" ' + (deployment.hasOwnProperty("constructionSitePreparationFeedback") ?' checked' :'') + '>' +
                    '<label class="btn_change" ' + (deployment.hasOwnProperty("constructionSitePreparationFeedback") ?'title="Anlage Baustellenvorbeitung (OK)"' :'title="Anlage Baustellenvorbeitung (nicht OK)"') + ' data-id="' + deployment.id + '" data-kind="construction-site-preparation" for="BaustelleOK' + deployment.id + '"><span class="checkboxStyle"></span></label>' +
                '</td>' +
                '<td>' +
                    '<input type="checkbox" style="display: none;" name="NetzanbindungOK' + deployment.id + '" id="NetzanbindungOK' + deployment.id + '" ' + (deployment.hasOwnProperty("internetConnection") ?' checked' :'') + '>' +
                    '<label class="btn_change" ' + (deployment.hasOwnProperty("internetConnection") ?'title="Netzbindung (OK)"' :'title="Netzbindung (nicht OK)"') + ' data-id="' + deployment.id + '" data-kind="internet-connection" for="NetzanbindungOK' + deployment.id + '"><span class="checkboxStyle"></span></label>' +
                '</td>' +
                '<td><a href="bestelltool.html?id=' + deployment.id + '" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>' +
            '</tr>';
        }
    }
    orderingsDom = orderingsDom === "" ?"<tr><td>Keine neuen Standorte gefunden</tr></td>" :orderingsDom;
    $("#orderlist").html(orderingsDom);
    $('.btn_change').click(function(e) {
        let id = $(this).data("id");
        let kind = $(this).data('kind');
        let data = !$(this).prev().is(':checked');
        setChecklistDeployments(id, kind, data).then(getDeployments).then(setDeployments);
	}); 
    $("#pageloader").hide();
}

function setChecklistDeployments(id, kind, data) {
	$('#pageloader').show();
	return $.ajax({
		url: "https://backend.homeinfo.de/deployments/" + id + "/" + kind,
		type: "POST",
		contentType: 'application/json',
		data: JSON.stringify(data),
		success: function (msg) {	},
		error: function (msg) {
			setErrorMessage(msg, "Ändern der Checkliste");
		}
	});	
}