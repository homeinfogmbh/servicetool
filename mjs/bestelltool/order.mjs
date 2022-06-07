/*
  order.mjs - Order new deployments.

  (C) 2022 HOMEINFO - Digitale Informationssysteme GmbH

  This library is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this library.  If not, see <http://www.gnu.org/licenses/>.

  Maintainer: Richard Neumann <r dot neumann at homeinfo period de>
*/

'use strict';

import { toHTMLList, handleError } from '../common.mjs';
import { regenerateAutocompleteList } from './autocomplete.mjs';
import { ID_TO_MODEL, ID_TO_CONNECTION, URL_PARAMS } from './constants.mjs';
import { CustomerListEntry, getSelectedCustomerId } from './customer-list.mjs';
import { getDeployments } from './deployments.mjs';


/*
    Render page for a new deployments.
*/
export function render () {
    disableChecklist();
    getDeployments();
    initButtons();
    getCustomers();
}


/*
    Create a new deployment.
*/
function createNewDeployment () {
    const newDeployment = getNewDeployment();

    if (!validateNewDeployment(newDeployment))
        return Promise.reject('Fehlende Daten.');

    return $.ajax({
        url: 'https://backend.homeinfo.de/deployments/',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(newDeployment),
        dataType: 'json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    });
}


/*
    Retrieve then render the list of available customers.
*/
function getCustomers () {
    $.ajax({
        url: 'https://backend.homeinfo.de/deployments/customers/',
        dataType: 'json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    }).then(renderCustomers);
}


/*
    Construct a JSON object representing a new deployment.
*/
function getNewDeployment () {
    return {
        customer: getSelectedCustomerId(),
        street: $('#street').val() || null,
        houseNumber: $('#houseNumber').val() || null,
        zipCode: $('#zipCode').val() || null,
        city: $('#city').val() || null,
        annotation: $('#annotation').val() || null,
        connection: getSelectedConnection()
    };
}


/*
    Validate a JSON object representing a new deployment.
*/
function validateNewDeployment (deployment) {
    const issues = [];

    if (deployment.customer == null || newOrder.customer < 1)
        issues.push('Kein Kunde ausgewählt.');

    if (!deployment.street)
        issues.push('Keine Straße angegeben.');

    if (!deployment.houseNumber)
        issues.push('Keine Hausnummer angegeben.');

    if (!deployment.zipCode)
        issues.push('Keine PLZ angegeben.');

    if (!deployment.city)
        issues.push('Kein Ort angegeben.');

    if (!deployment.connection)
        issues.push('Keine Netzanbindung ausgewählt.');

    if (issues.length == 0)
        return true;

    Swal.fire({
        icon: 'error',
        iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
        title: 'Fehler',
        html: toHTMLList(issues),
        confirmButtonColor: '#0074A5'
    })
    return false;
}


/*
    Render the list of available customer.
*/
function renderCustomers (customers) {
    const customerNotSelected = new CustomerListEntry(
        -1, 'Bitte Kunden auswählen'
    );
    const customerListEntries = []

    for (const customer of customers)
        customerListEntries.push(CustomerListEntry.fromJSON(customer));

    customerListEntries.sort(CustomerListEntry.compare);
    $('#Kundenauswählen').html('');
    $('#Kundenauswählen').append(customerNotSelected.toHTML());

    for (const customerListEntry of customerListEntries)
        $('#Kundenauswählen').append(customerListEntry.toHTML());
}


/*
    Return the selected connection type.
*/
function getSelectedConnection () {
    const key = $('input[name="ArtDerNetz"]:checked').attr('id');

    if (key == null)
        return null;

    return ID_TO_CONNECTION[key];
}


/*
    Create new deployment.
*/
function onSubmit (event) {
    return createNewDeployment().then(response => {
        window.location = window.location + '?id=' + response.id;
    });
}

/*
    Initialize the buttons on the page.
*/
function initButtons () {
    $('#street').keyup(regenerateAutocompleteList);
    $('#street').click(regenerateAutocompleteList);
    $('#submit').click(onSubmit);
}


/*
    Disable the checklist and history columns for deployments.
*/
export function disableChecklist () {
    $('.checklist').prop('disabled', true);
    $('#checklist').find('*').css({opacity: 0.7});
    $('#history-col').find('*').css({opacity: 0.7});
}