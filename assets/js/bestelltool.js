/*
  bestelltool.js - JavaScript module for the ordering subsystem.

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

const ID_TO_MODEL = {
    'Touch24': 'Standard 24"',
    'Touch34': 'Standard 32"',
    'PhoenixTouch24': 'Phönix',
    'NeptunTouch24': 'Neptun',
    'model-other': 'other'
};
const MODEL_TO_ID = {
    'Standard 24&quot;': 'Touch24',
    'Standard 32&quot;"': 'Touch34',
    'Phönix': 'PhoenixTouch24',
    'Neptun': 'NeptunTouch24',
    'other': 'model-other'
};
const ID_TO_CONNECTION = {
    'ADSL': 'DSL',
    'lte3G4G': 'LTE'
};
const CONNECTION_TO_ID = {
    'DSL': 'ADSL',
    'LTE': 'lte3G4G'
};
const URL_PARAMS = new URLSearchParams(window.location.search);

let DELAYED_SUBMIT_ANNOTATION_JOB = null;
let DEPLOYMENTS = [];


/*
    Container for history item information.
*/
class HistoryItem {
    constructor (caption, timestamp) {
        this.caption = caption;
        this.timestamp = timestamp;
    }

    static * fromOrder (order) {
        if (order.constructionSitePreparationFeedback != null)
            yield new this(
                'Anlage Baustellenvorbeitung erledigt',
                new Date(order.constructionSitePreparationFeedback)
            );

        if (order.internetConnection != null)
            yield new this(
                'Netzanbindung erfolgt',
                new Date(order.internetConnection)
            );

        if (order.installationDateConfirmed != null)
            yield new this(
                'Datum Installation bestätigt',
                new Date(order.installationDateConfirmed)
            );

        if (order.hardwareInstallation != null)
            yield new this(
                'Hardware installiert',
                new Date(order.hardwareInstallation)
            );

        if (order.finalized != null)
            yield new this(
                'Bestellung abgeschlossen',
                new Date(order.finalized)
            );
    }

    toHTML () {
        const tr = document.createElement('tr');
        const col1 = document.createElement('td');
        col1.classList.add('w130');
        col1.textContent = (
            this.timestamp.getDate()
            + '.'
            + (this.timestamp.getMonth() + 1)
            + '.'
            + this.timestamp.getFullYear()
        );
        tr.appendChild(col1);
        const col2 = document.createElement('td');
        col2.textContent = this.caption;
        tr.appendChild(col2);
        return tr;
    }
}


/*
    Representation of customer list entries.
*/
class CustomerListEntry {
    constructor (id, abbreviation) {
        this.id = id;
        this.abbreviation = abbreviation;
    }

    static compare (lhs, rhs) {
        if (lhs.abbreviation == rhs.abbreviation)
            return 0;

        if (lhs.abbreviation < rhs.abbreviation)
            return -1;

        return 1;
    }

    static fromJSON (json) {
        return new this(json.id, json.abbreviation);
    }

    toHTML () {
        const option = document.createElement('option')
        option.setAttribute('value', this.id);
        option.textContent = this.abbreviation;
        return option;
    }
}


/*
    Match a deployment against the current address and customer.
*/
function matchDeployment (
    deployment, customerId, street, houseNumber, zipCode, city
) {
    if (customerId && customerId != deployment.customer.id)
        return false;

    if (!isSubstrNocasematchOrNull(street, deployment.address.street))
        return false;

    if (!isSubstrNocasematchOrNull(
        houseNumber, deployment.address.houseNumber
    ))
        return false;

    if (!isSubstrNocasematchOrNull(zipCode, deployment.address.zipCode))
        return false;

    if (!isSubstrNocasematchOrNull(city, deployment.address.city))
        return false;

    return true;
}


/*
    Yield deployments that match the filtering criteria.
*/
function * filterDeployments () {
    for (const deployment of DEPLOYMENTS) {
        if (matchDeployment(
            deployment, getSelectedCustomerId(), $('#street').val(),
            $('#houseNumber').val(), $('#zipCode').val(), $('#city').val()
        ))
            yield deployment;
    }
}


/*
    Remove the auto completion list.
*/
function removeAutocompleteList (textInput) {
    const parent = textInput.parentNode;

    for (const childNode of parent.childNodes)
        if (childNode.classList && childNode.classList.contains('autocomplete-items'))
            parent.removeChild(childNode);
}


/*
    Select an autocomplete item.
*/
function selectAutocompleteItem (event) {
    $('#street').val(event.target.getAttribute('data-street'));
    $('#houseNumber').val(event.target.getAttribute('data-house-number'));
    $('#zipCode').val(event.target.getAttribute('data-zip-code'));
    $('#city').val(event.target.getAttribute('data-city'));
    removeAutocompleteList(document.getElementById('street'));
}


/*
    Create a list item for the auto completion.
*/
function createAutocompleteListItem (address) {
    const div = document.createElement('div');
    div.classList.add('autocomplete-item');
    div.setAttribute('data-street', address.street);
    div.setAttribute('data-house-number', address.houseNumber);
    div.setAttribute('data-zip-code', address.zipCode);
    div.setAttribute('data-city', address.city);
    div.textContent = (
        address.street + ' ' + address.houseNumber
        + ', ' + address.zipCode + ' ' + address.city
    );
    div.addEventListener('click', selectAutocompleteItem);
    return div;
}


/*
    Create list with auto completion entries.
*/
function createAutocompleteList (textInput) {
    const list = document.createElement('div');
    list.classList.add('autocomplete-items');

    for (const deployment of filterDeployments())
        list.appendChild(createAutocompleteListItem(deployment.address));

    if (textInput.nextSibling)
        textInput.parentNode.insertBefore(list, textInput.nextSibling);
    else
        textInput.parentNode.appendChild(list);
}


/*
    Re-generate the completion list.
*/
function regenerateAutocompleteList (event) {
    removeAutocompleteList(event.target);
    createAutocompleteList(event.target);
}


/*
    Handle generic Ajax Query errors.
*/
function handleError (jqXHR, textStatus, errorThrown) {
    Swal.fire({
        icon: 'error',
        title: textStatus,
        text: errorThrown,
        footer: '<pre>' + JSON.stringify(jqXHR, null, 2) + '</pre>'
    })
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
    Query an order by its ID.
*/
function getOrder (id) {
    return $.ajax({
        url: getOrderURL(id),
        dataType: 'json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    });
}


/*
    Query a list of deployments from the backend.
*/
function getDeployments () {
    return $.ajax({
        url: 'https://ddborder.homeinfo.de/deployments',
        dataType: 'json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    });
}


/*
    Return true iff the first string is a substring of the second string with
    both strings being converted to lower case beforehand with case-insensitive
    matching.
*/
function isSubstrNocasematch (substring, string) {
    substring = substring.trim().toLowerCase();
    string = string.toLowerCase();

    if (substring.length > string.length)
        return false;

    return string.substring(0, substring.length) == substring;
}


/*
    Return true iff the customer ID is null or the customer ID matches the
    deployment's customer ID.
*/
function matchCustomerId (customerId, deployment) {
    if (customerId == null)
        return true;

    return deployment.customer.id == customerId;
}


/*
    Return true iff substring is null or if substring is a substring of string
    while checking case-insensitively.
*/
function isSubstrNocasematchOrNull (substring, string) {
    if (substring == null)
        return true;

    return isSubstrNocasematch(substring, string);
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
    Convert an iterable into a HTML list.
*/
function toHTMLList (items, type = 'ul') {
    const list = document.createElement(type);
    let element = null;

    for (const item of items) {
        element = document.createElement('li');
        element.textContent = item;
        list.appendChild(element);
    }

    return list;
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
        issues.push('Kein Modell ausgewählt.');

    if (!newOrder.connection)
        issues.push('Keine Internetanbindung ausgewählt.');

    if (issues.length == 0)
        return true;

    Swal.fire({
        icon: 'error',
        title: 'Fehlende Angaben',
        html: toHTMLList(issues)
    })
    return false;
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
    Create new order or modify an existing order.
*/
function onSubmit (event) {
    return createNewOrder().then(response => {
        window.location = window.location + '?id=' + response.id;
    });
}


/*
    Set the state of the given checklist item by its endpoint name to the given
    state.
*/
function setChecklistItem (endpoint) {
    return event => {
        return $.ajax({
            url: getOrderURL(getCurrentOrderId(), endpoint),
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(event.target.checked),
            dataType: 'json',
            error: handleError,
            xhrFields: {
                withCredentials: true
            }
        });
    };
}


/*
    Disable the checklist and history columns for new orders.
*/
function disableChecklist () {
    $('.checklist').prop('disabled', true);
    $('#checklist').find('*').css({opacity: 0.7});
    $('#history-col').find('*').css({opacity: 0.7});
}


/*
    Disable the basis data column for existing orders view.
*/
function disableBasisData () {
    $('.basic-data').prop('disabled', true);
    $('#submit').hide();
    $('#basic-data').find('*').css({opacity: 0.7});
}


/*
    Return a submit function given the respective event.
*/
function submitAnnotation (event) {
    return function () {
        return $.ajax({
            url: getOrderURL(getCurrentOrderId(), 'annotation'),
            method: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify(event.target.value),
            dataType: 'json',
            error: handleError,
            xhrFields: {
                withCredentials: true
            }
        });
    };
}


/*
    Start a delayed job to submit the annotation.
*/
function delaySubmitAnnotation (event) {
    if (DELAYED_SUBMIT_ANNOTATION_JOB != null)
        clearTimeout(DELAYED_SUBMIT_ANNOTATION_JOB);

    DELAYED_SUBMIT_ANNOTATION_JOB = setTimeout(submitAnnotation(event), 1000);
}

/*
    Initialize the buttons on the page.
*/
function initButtons () {
    $('#street').keyup(regenerateAutocompleteList);
    $('#submit').click(onSubmit);
    $('#Anlage').click(setChecklistItem('construction-site-preparation'));
    $('#Netzbindung').click(setChecklistItem('internet-connection'));
    $('#DatumInstallation').click(setChecklistItem('installation-date-confirmed'));
    $('#Hardware').click(setChecklistItem('hardware-installation'));
    $('#Abgeschlossen').click(setChecklistItem('finalize'));
    $('#Bemerkung').keyup(delaySubmitAnnotation);
}


/*
    Render the list of available customer.
*/
function renderCustomers (customers) {
    const customerNotSelected = new CustomerListEntry(-1, 'Bitte auswählen');
    const customerListEntries = []

    for (const customer of customers)
        customerListEntries.push(CustomerListEntry.fromJSON(customer));

    customerListEntries.sort(CustomerListEntry.compare);
    $('#Kundenauswählen').append(customerNotSelected.toHTML());

    for (const customerListEntry of customerListEntries)
        $('#Kundenauswählen').append(customerListEntry.toHTML());
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
    Render page for a new order.
*/
function renderNewOrder () {
    disableChecklist();
    getDeployments().then(deployments => { DEPLOYMENTS = deployments; });
    initButtons();
    getCustomers();
}


/*
    Set the selected customer.
*/
function setSelectedCustomer (customer) {
    const listEntry = CustomerListEntry.fromJSON(customer).toHTML();
    $('#Kundenauswählen').append(listEntry);
    $('#Kundenauswählen').attr('selected', customer.id);
}


/*
    Set the selected model.
*/
function setSelectedModel (model) {
    const id = MODEL_TO_ID[model];

    if (id == null)
        throw 'Cannot translate model to id: ' + model;

    $('#' + id).prop("checked", true);
}


/*
    Set the selected connection.
*/
function setSelectedConnection (connection) {
    const id = CONNECTION_TO_ID[connection];

    if (id == null)
        throw 'Cannot translate connection to id: ' + connection;

    $('#' + id).prop("checked", true);
}


/*
    Render basic data block.
*/
function renderBasicData (order) {
    setSelectedCustomer(order.customer);
    $('#street').val(order.street);
    $('#houseNumber').val(order.houseNumber);
    $('#zipCode').val(order.zipCode);
    $('#city').val(order.city);
    setSelectedModel(order.model);
    setSelectedConnection(order.connection);
}


/*
    Render checklist.
*/
function renderChecklist (order) {
    $('#Anlage').prop(
        'checked', order.constructionSitePreparationFeedback != null
    );
    $('#Netzbindung').prop('checked', order.internetConnection != null);
    $('#DatumInstallation').prop(
        'checked', order.installationDateConfirmed != null
    );
    $('#Hardware').prop('checked', order.hardwareInstallation != null);
    $('#Abgeschlossen').prop('checked', order.finalized != null);
    $('#Bemerkung').val(order.annotation);
}


/*
    Render history.
*/
function renderHistory (order) {
    const historyItems = Array.from(HistoryItem.fromOrder(order));
    historyItems.sort((lhs, rhs) => {
        return lhs.timestamp - rhs.timestamp;
    });

    for (const historyItem of historyItems)
        $('#history').append(historyItem.toHTML());
}


/*
    Render an order into the core data fields.
*/
function renderOrder (order) {
    renderBasicData(order);
    renderChecklist(order);
    renderHistory(order);
}


/*
    Render page for modifying an existing order.
*/
function renderPatchOrder (id) {
    disableBasisData();
    initButtons();
    getOrder(id).then(renderOrder);
}


/*
    Return the order ID.
*/
function getCurrentOrderId () {
    const id = URL_PARAMS.get('id');

    if (id == null)
        return null;

    return parseInt(id);
}


/*
    Render page dependent on requested view.
*/
function init () {
    const id = getCurrentOrderId();

    if (id == null)
        return renderNewOrder();

    return renderPatchOrder(id);
}


$(document).ready(init);
