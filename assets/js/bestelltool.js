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

let CURRENT_ODER_ID = null;
let DEPLOYMENTS = [];


/*
    Return a URL for the current order.
*/
function getCurrentOrderURL () {
    if (CURRENT_ODER_ID == null)
        throw 'No order selected.';

    return 'https://ddborder.homeinfo.de/order/' + CURRENT_ODER_ID;
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
    });
}


/*
    Return true iff the first string is a substring of the second string with
    both strings being converted to lower case beforehand for case-insensitive
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
    Group deployments by customer.
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
        ):
            yield deployment;
    }
}


/*
    Return the ID of the selected customer.
    If not customer has been selected, return null.
*/
function getSelectedCustomerId () {
    const selectedCustomerId = $('#Kundenauswählen').val();

    if (!selectedCustomerId)
        return null;

    return Integer.parse(selectedCustomerId);
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
        data: {
            customer: getSelectedCustomerId(),
            street: ('#street').val() || null,
            houseNumber: ('#houseNumber').val() || null,
            zipCode: ('#zipCode').val() || null,
            city: ('#city').val() || null
            model: getSelectedModel(),
            connection: getSelectedConnection()
        }
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        }
    }).then(
        response => {
            CURRENT_ODER_ID = response.id;
        };
    );
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
    if (CURRENT_ODER_ID == null)
        return createNewOrder();

    return patchOrder(CURRENT_ODER_ID);
}


/*
    Handle a click on a given check box.
*/
function onCheckboxClick (handler) {
     return event => {
        handler(event.target.checked);
     };
}


/*
    Initialize the buttons on the page.
*/
function initButtons () {
    $('#street').change(onAddressChange);
    $('#submit').click(onSubmit);
    $('#Anlage').click(onCheckboxClick(
        setConstructionSitePreparationFeedback
    ));
    $('#Netzbindung').click(onCheckboxClick(setInternetConnection));
    $('#DatumInstallation').click(onCheckboxClick(
        setInstallationDateConfirmed
    ));
    $('#Hardware').click(onCheckboxClick(setHardwareInstalled));
    $('#Abgeschlossen').click(onCheckboxClick(setFinalized));
}


/*
    Render page for a new order.
*/
function renderNewOrder () {
    getDeployments().then(deployments => { DEPLOYMENTS = deployments; });
    initButtons();
}
