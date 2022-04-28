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
    'NeptunTouch24': 'Neptun'
};
const MODEL_TO_ID = {
    'Standard 24&quot;': 'Touch24',
    'Standard 32&quot;"': 'Touch34',
    'Phönix': 'PhoenixTouch24',
    'Neptun': 'NeptunTouch24'
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
    constructor (id, name, abbreviation) {
        this.id = id;
        this.name = name;
        this.abbreviation = abbreviation;
    }

    static fromJSON (json) {
        return new this(json.id, json.company.name, json.company.abbreviation);
    }

    toHTML () {
        const option = document.createElement('option')
        option.setAttribute('value', this.id);
        option.textContent = this.abbreviation || this.name;
        return option;
    }
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
        xhrFields: {
            withCredentials: true
        }
    }).then(deployments => {
        DEPLOYMENTS = deployments;
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
    Filter deployments by customer and address information.
*/
function * filterDeployments (
        deployments, customerId, street, houseNumber, zipCode, city
) {
    for (const deployment of deployments) {
        if (
            matchCustomerId(customerId, deployment)
            && isSubstrNocasematchOrNull(street, deployment.address.street)
            && isSubstrNocasematchOrNull(
                houseNumber, deployment.address.houseNumber
            )
            && isSubstrNocasematchOrNull(zipCode, deployment.address.zipCode)
            && isSubstrNocasematchOrNull(city, deployment.address.city)
        )
            yield deployment;
    }
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
        throw 'No model selected.';

    const value = ID_TO_MODEL[key];

    if (value == null)
        throw 'Cannot translate model key: ' + key;

    return value;
}


/*
    Return the selected connection type.
*/
function getSelectedConnection () {
    const key = $('input[name="ArtDerNetz"]:checked').attr('id');

    if (key == null)
        throw 'No model selected.';

    const value = ID_TO_CONNECTION[key];

    if (value == null)
        throw 'Cannot translate connection key: ' + key;

    return value;
}


/*
    Filter deployments matching the partially entered address and display
    those as hints to existing addresses.
*/
function onAddressChange (event) {
    const deployments = Array.from(filterDeployments(
        DEPLOYMENTS,
        getSelectedCustomerId(),
        $('#street').val() || null,
        $('#houseNumber').val() || null,
        $('#zipCode').val() || null,
        $('#city').val() || null
    ));
    // TODO: implement display of matches.
}


/*
    Create a new order.
*/
function createNewOrder () {
    return $.ajax({
        url: 'https://ddborder.homeinfo.de/order',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            customer: getSelectedCustomerId(),
            street: $('#street').val() || null,
            houseNumber: $('#houseNumber').val() || null,
            zipCode: $('#zipCode').val() || null,
            city: $('#city').val() || null,
            model: getSelectedModel(),
            connection: getSelectedConnection()
        }),
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        }
    }).then(response => {
        window.location = window.location + '?id=' + response.id;
    });
}


/*
    Create new order or modify an existing order.
*/
function onSubmit (event) {
    return createNewOrder();
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
    $('#street').change(onAddressChange);
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
    for (const customer of customers)
        $('#Kundenauswählen').append(
            CustomerListEntry.fromJSON(customer).toHTML()
        );
}


/*
    Retrieve then render the list of available customers.
*/
function getCustomers () {
    $.ajax({
        url: 'https://ddborder.homeinfo.de/customers',
        dataType: 'json',
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
    initButtons();
    getDeployments();
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
    Render an order into the core data fields.
*/
function renderOrder (order) {
    // Basic data
    setSelectedCustomer(order.customer);
    $('#street').val(order.street);
    $('#houseNumber').val(order.houseNumber);
    $('#zipCode').val(order.zipCode);
    $('#city').val(order.city);
    setSelectedModel(order.model);
    setSelectedConnection(order.connection);

    // Check list
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

    // History
    const historyItems = Array.from(HistoryItem.fromOrder(order));
    historyItems.sort((lhs, rhs) => {
        return lhs.timestamp - rhs.timestamp;
    });

    for (const historyItem of historyItems)
        $('#history').append(historyItem.toHTML());
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
function render () {
    const id = getCurrentOrderId();

    if (id == null)
        return renderNewOrder();

    return renderPatchOrder(id);
}


$(document).ready(render);
