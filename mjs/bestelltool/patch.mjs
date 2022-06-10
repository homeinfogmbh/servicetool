/*
  patch.mjs - Patching of Deployments.

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


import { DelayedJobs, handleError } from '../common.mjs';
import { MODEL_TO_ID, CONNECTION_TO_ID, URL_PARAMS } from './constants.mjs';
import { CustomerListEntry } from './customer-list.mjs';
import { renderHistory } from './history.mjs';

const DELAYED_JOBS = new DelayedJobs();


/*
    Render page for modifying an existing order.
*/
export function render (id) {
    disableBasisData();
    initButtons();
    getDeployment(id).then(renderDeployment);
}


/*
    Return the current deployment ID.
*/
export function getCurrentId () {
    const id = URL_PARAMS.get('id');

    if (id == null)
        return null;

    return parseInt(id);
}


/*
    Query a deployment by its ID.
*/
function getDeployment (id) {
    return $.ajax({
        url: getDeploymentURL(id),
        dataType: 'json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    });
}


/*
    Return a URL for the given deployment.
    Optionally specify a trailing endpoint.
*/
function getDeploymentURL (id, endpoint = null) {
    if (id == null)
        throw 'No order selected.';

    if (endpoint == null)
        return 'https://backend.homeinfo.de/deployments/' + id;

    return getDeploymentURL(id) + '/' + endpoint;
}


/*
    Render checklist.
*/
function renderChecklist (deployment) {
    $('#Anlage').prop(
        'checked', deployment.constructionSitePreparationFeedback != null
    );
    $('#Netzbindung').prop('checked', deployment.internetConnection != null);
    $('#Bemerkung').val(deployment.technicianAnnotation);
}


/*
    Set the state of the given checklist item
    by its endpoint name to the given state.
*/
function setChecklistItem (endpoint) {
    return event => {
        return $.ajax({
            url: getDeploymentURL(getCurrentId(), endpoint),
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
    Set the selected customer.
*/
function setSelectedCustomer (customer) {
    const listEntry = CustomerListEntry.fromJSON(customer).toHTML();
    $('#Kundenauswählen').append(listEntry);
    $('#Kundenauswählen').attr('selected', customer.id);
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
    Render a deployment into the core data fields.
*/
function renderDeployment (deployment) {
    renderBasicData(deployment);
    renderChecklist(deployment);
    renderHistory(deployment);
}


/*
    Render basic data block.
*/
function renderBasicData (deployment) {
    setSelectedCustomer(deployment.customer);
    $('#street').val(deployment.address.street);
    $('#houseNumber').val(deployment.address.houseNumber);
    $('#zipCode').val(deployment.address.zipCode);
    $('#city').val(deployment.address.city);
    setSelectedConnection(deployment.connection);
}


/*
    Start a delayed job to submit the annotation.
*/
function delaySubmitAnnotation (event) {
    DELAYED_JOBS.reschedule(
        'submitAnnotation',
        function () {
            return $.ajax({
                url: getDeploymentURL(getCurrentId(), 'annotation'),
                method: 'PATCH',
                contentType: 'application/json',
                data: JSON.stringify(event.target.value),
                dataType: 'json',
                error: handleError,
                xhrFields: {
                    withCredentials: true
                }
            });
        },
        1000
    );
}


/*
    Delete the current deployment.
*/
function deleteDeployment (event) {
    return $.ajax({
        url: getDeploymentURL(getCurrentId()),
        method: 'DELETE',
        contentType: 'application/json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    });
}


/*
    Initialize the buttons on the page.
*/
function initButtons () {
    $('#Anlage').click(setChecklistItem('construction-site-preparation'));
    $('#Netzbindung').click(setChecklistItem('internet-connection'));
    $('#Bemerkung').keyup(delaySubmitAnnotation);
    $('#deleteDeployment').click(deleteDeployment)
}


/*
    Disable the basis data column for existing orders view.
*/
export function disableBasisData () {
    $('.basic-data').prop('disabled', true);
    $('#submit').hide();
    $('#basic-data').find('*').css({opacity: 0.7});
}