/*
  order.mjs - Orders management library.

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


import { toHTMLList } from '../common.mjs';
import { regenerateAutocompleteList } from './autocomplete.mjs';
import {
    ID_TO_MODEL, MODEL_TO_ID, ID_TO_CONNECTION, CONNECTION_TO_ID, URL_PARAMS
} from './constants.mjs';
import { CustomerListEntry } from './customer-list.mjs';
import { disableChecklist } from './checklist.mjs';
import { getDeployments } from './deployments.mjs';


/*
    Disable the basis data column for existing orders view.
*/
export function disableBasisData () {
    $('.basic-data').prop('disabled', true);
    $('#submit').hide();
    $('#basic-data').find('*').css({opacity: 0.7});
}


/*
    Render page for a new order.
*/
export function render () {
    disableChecklist();
    getDeployments();
    initButtons();
    getCustomers();
}


/*
    Create a new order.
*/
function createNewOrder () {
    const newOrder = getNewOrder();

    if (!validateNewOrder(newOrder))
        return Promise.reject('Fehlende Daten.');

    return $.ajax({
        url: 'https://ddborder.homeinfo.de/order',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(newOrder),
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
        url: 'https://ddborder.homeinfo.de/customers',
        dataType: 'json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    }).then(renderCustomers);
}


/*
    Return a URL for the given order.
    Optionally specify a trailing endpoint.
*/
function getOrderURL (id, endpoint = null) {
    if (id == null)
        throw 'No order selected.';

    if (endpoint == null)
        return 'https://ddborder.homeinfo.de/order/' + id;

    return getOrderURL(id) + '/' + endpoint;
}


/*
    Construct a JSON object representing a new order.
*/
function getNewOrder () {
    return {
        customer: getSelectedCustomerId(),
        street: $('#street').val() || null,
        houseNumber: $('#houseNumber').val() || null,
        zipCode: $('#zipCode').val() || null,
        city: $('#city').val() || null,
        model: getSelectedModel(),
        connection: getSelectedConnection()
    };
}


/*
    Validate a JSON object representing a new order.
*/
function validateNewOrder (newOrder) {
    const issues = [];

    if (newOrder.customer == null || newOrder.customer < 1)
        issues.push('Kein Kunde ausgewählt.');

    if (!newOrder.street)
        issues.push('Keine Straße angegeben.');

    if (!newOrder.houseNumber)
        issues.push('Keine Hausnummer angegeben.');

    if (!newOrder.zipCode)
        issues.push('Keine PLZ angegeben.');

    if (!newOrder.city)
        issues.push('Kein Ort angegeben.');

    if (!newOrder.model)
        issues.push('Keine Displayart ausgewählt.');

    if (!newOrder.connection)
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
    $('#Kundenauswählen').append(customerNotSelected.toHTML());

    for (const customerListEntry of customerListEntries)
        $('#Kundenauswählen').append(customerListEntry.toHTML());
}


/*
    Return the ID of the selected customer.
    If no customer has been selected, return null.
*/
function getSelectedCustomerId () {
    const selectedCustomerId = $('#Kundenauswählen').val();

    if (!selectedCustomerId)
        return null;

    return parseInt(selectedCustomerId);
}


/*
    Return the selected hardware model.
*/
function getSelectedModel () {
    const key = $('input[name="Artdes"]:checked').attr('id');

    if (key == null)
        return null;

    return ID_TO_MODEL[key];
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
    Create new order or modify an existing order.
*/
function onSubmit (event) {
    return createNewOrder().then(response => {
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