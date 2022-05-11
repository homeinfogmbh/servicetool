$(document).ready(function() {
    getOrderings().then(setOrderings);
});

function setOrderings(orderings) {
    let orderingsDom = "";
    let address;
    for (let order of orderings) {
        address = order.street + " " + order.houseNumber + ", " + order.zipCode + " " + order.city
        orderingsDom += '<tr>' +
            '<td>' + order.customer.abbreviation + '</td>' +
            '<td title="' + address + '">' + address.substring(0, 12) + (address.length > 13 ? '...' :'') +  '</td>' +
            '<td>' + order.model + '</td>' +
            '<td>' + formatDate(order.issued) + '</td>' +
            '<td>' +
                '<input type="checkbox" style="display: none;" name="LieferdatumOK' + order.id + '" id="LieferdatumOK' + order.id + '" ' + (order.hasOwnProperty("finalized") ?'disabled' :'') + (order.hasOwnProperty("installationDateConfirmed") ?' checked' :'') + '>' +
                '<label class="btn_change" data-id="' + order.id + '" data-kind="installation-date-confirmed" for="LieferdatumOK' + order.id + '"><span class="checkboxStyle" ' + (order.hasOwnProperty("finalized") ?'style="opacity:0.3"' :'') + '></span></label>' +
            '</td>' +
            '<td>' +
                '<input type="checkbox" style="display: none;" name="BaustelleOK' + order.id + '" id="BaustelleOK' + order.id + '" ' + (order.hasOwnProperty("finalized") ?'disabled' :'') + (order.hasOwnProperty("constructionSitePreparationFeedback") ?' checked' :'') + '>' +
                '<label class="btn_change" data-id="' + order.id + '" data-kind="construction-site-preparation" for="BaustelleOK' + order.id + '"><span class="checkboxStyle" ' + (order.hasOwnProperty("finalized") ?'style="opacity:0.3"' :'') + '></span></label>' +
            '</td>' +
            '<td>' +
                '<input type="checkbox" style="display: none;" name="NetzanbindungOK' + order.id + '" id="NetzanbindungOK' + order.id + '" ' + (order.hasOwnProperty("finalized") ?'disabled' :'') + (order.hasOwnProperty("internetConnection") ?' checked' :'') + '>' +
                '<label class="btn_change" data-id="' + order.id + '" data-kind="internet-connection" for="NetzanbindungOK' + order.id + '"><span class="checkboxStyle" ' + (order.hasOwnProperty("finalized") ?'style="opacity:0.3"' :'') + '></span></label>' +
            '</td>' +
            '<td>' +
                '<input type="checkbox" style="display: none;" name="HardwareInstalliert' + order.id + '" id="HardwareInstalliert' + order.id + '" ' + (order.hasOwnProperty("finalized") ?'disabled' :'') + (order.hasOwnProperty("hardwareInstallation") ?' checked' :'') + '>' +
                '<label class="btn_change" data-id="' + order.id + '" data-kind="hardware-installation" for="HardwareInstalliert' + order.id + '"><span class="checkboxStyle" ' + (order.hasOwnProperty("finalized") ?'style="opacity:0.3"' :'') + '></span></label>' +
            '</td>' +
            '<td>' +
                '<input type="checkbox" style="display: none;" name="Abschließen' + order.id + '" id="Abschließen' + order.id + '" ' + (order.hasOwnProperty("finalized") ?'disabled' :'') + (order.hasOwnProperty("finalized") ?' checked' :'') + '>' +
                '<label class="btn_change" data-id="' + order.id + '" data-kind="finalize" for="Abschließen' + order.id + '"><span class="checkboxStyle" ' + (order.hasOwnProperty("finalized") ?'style="opacity:0.3"' :'') + '></span></label>' +
            '</td>' +
            '<td><a href="bestelltool.html?id=' + order.id + '" class="huntinglink"><img src="assets/img/circle-right.svg" alt="huntinglink"></a></td>' +
            '</tr>';
    }
    $("#orderlist").html(orderingsDom);
    $('.btn_change').click(function(e) {
        let id = $(this).data("id");
        let kind = $(this).data('kind');
        let data = !$(this).prev().is(':checked');
        if ($(this).data('kind') != "finalize") {
            setChecklist(id, kind, data).then(getOrderings).then(setOrderings);
        } else {
            let thisobject = $(this);
            Swal.fire({
                title: 'Sind Sie sicher?',
                text: "Wollen Sie das System wirklich abschließen?",
                showCancelButton: true,
                confirmButtonColor: '#009fe3',
                cancelButtonColor: '#ff821d',
                iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
                confirmButtonText: 'Ja, abschließen!',
                cancelButtonText: 'Vorgang abbrechen!',
                buttonsStyling: true
            }).then(function(selection) {
                if (selection.isConfirmed === true)
                    setChecklist(id, kind, true).then(getOrderings).then(setOrderings);
                else
                    thisobject.prev().prop('checked', false)
            })
        }
	}); 
    $("#pageloader").hide();
}

function getOrderings() {
	return $.ajax({
		url: "https://ddborder.homeinfo.de/order",
		type: "GET",
		success: function (msg) {
		},
		error: function (msg) {
			setErrorMessage(msg, "Abrufen der Bestellungen");
		}
	});
}

function setChecklist(id, kind, data) {
	$('#pageloader').show();
	return $.ajax({
		url: "https://ddborder.homeinfo.de/order/" + id + "/" + kind,
		type: "POST",
		contentType: 'application/json',
		data: JSON.stringify(data),
		success: function (msg) {	},
		error: function (msg) {
			setErrorMessage(msg, "Ändern der Checkliste");
		}
	});	
}