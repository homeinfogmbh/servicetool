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

const MODELS = {
    'Touch24': 'Standard 24"',
    'Touch34': 'Standard 32"',
    'PhoenixTouch24': 'Phönix',
    'NeptunTouch24': 'Neptun'
};
const CONNECTIONS = {
    'ADSL': 'DSL',
    'lte3G4G': 'LTE'
};

let CURRENT_ORDER_ID = null;
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
    }).then(order => {
        CURRENT_ORDER_ID = order.id;
        return order;
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
    Return a function to match a deployment against a customer ID.
*/
function matchCustomerId (customerId) {
    return deployment => {
        if (customerId == null)
            return true;

        return deployment.customer.id == customerId;
    };
}


/*
    Return a function to match a substring against a string.
    If the substring is null, return true.
*/
function isSubstrNocasematchOrNull (substring) {
    return string => {
        if (substring == null)
            return true;

        return isSubstrNocasematch(substring, string);
    };
}


/*
    Filter deployments by customer and address information.
*/
function * filterDeployments (
        deployments, customerId, street, houseNumber, zipCode, city
) {
    for (const deployment of deployments) {
        if (
            matchCustomerId(customerId)(deployment)
            && isSubstrNocasematchOrNull(street)(deployment.address.street)
            && isSubstrNocasematchOrNull(houseNumber)(
                deployment.address.houseNumber
            )
            && isSubstrNocasematchOrNull(zipCode)(deployment.address.zipCode)
            && isSubstrNocasematchOrNull(city)(deployment.address.city)
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
    return MODELS[$('input[name="Artdes"]:checked').val()];
}


/*
    Return the selected connection type.
*/
function getSelectedConnection () {
    return CONNECTIONS[$('input[name="ArtDerNetz"]:checked').val()];
}


/*
    Filter deployments matching the partially entered address and display
    those as hints to existing addresses.
*/
function onAddressChange (event) {
    const deployments = Array.from(filterDeployments(
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
        mimeType: 'application/json',
        data: {
            customer: getSelectedCustomerId(),
            street: ('#street').val() || null,
            houseNumber: ('#houseNumber').val() || null,
            zipCode: ('#zipCode').val() || null,
            city: ('#city').val() || null,
            model: getSelectedModel(),
            connection: getSelectedConnection()
        },
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        }
    }).then(response => {
        CURRENT_ORDER_ID = response.id;
    });
}


/*
    Patch an existing order.
*/
function patchOrder (id) {
    // TODO: implement after discussion in meeting.
}


/*
    Create new order or modify an existing order.
*/
function onSubmit (event) {
    if (CURRENT_ORDER_ID == null)
        return createNewOrder();

    throw 'Cannot create new order in patch mode.';
}


/*
    Set the state of the given checklist item by its endpoint name to the given
    state.
*/
function setChecklistItem (endpoint) {
    return event => {
        return $.ajax({
            url: getOrderURL(CURRENT_ORDER_ID, endpoint),
            method: 'POST',
            mimeType: 'application/json',
            data: event.target.checked,
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
function disableChecklistAndHistory () {
    // TODO: implement
}


/*
    Disable the basis data column for existing orders view.
*/
function disableBasisData () {
    // TODO: implement
}


/*
    Return a submit function given the respective event.
*/
function submitAnnotation (event) {
    return function () {
        return $.ajax({
            url: getOrderURL(CURRENT_ORDER_ID, 'annotation'),
            method: 'PATCH',
            mimeType: 'application/json',
            data: event.target.value,
            dataType: 'json'
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
    $('#Bemerkung').change(delaySubmitAnnotation);
}


/*
    Render page for a new order.
*/
function renderNewOrder () {
    disableChecklistAndHistory();
    initButtons();
    getDeployments();
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
    Render page dependent on requested view.
*/
function render () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id == null)
        return renderNewOrder();

    return renderPatchOrder(parseInt(id));
}


$(document).ready(render);
