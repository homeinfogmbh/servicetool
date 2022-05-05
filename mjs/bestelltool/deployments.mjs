/*
  deployments.mjs - Deployments library.

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


import { isSubstrNocasematchOrNull, handleError } from '../common.mjs';
import { getSelectedCustomerId } from './customer-list.mjs';


let DEPLOYMENTS = [];


/*
    Query a list of deployments from the backend.
*/
export function getDeployments () {
    return $.ajax({
        url: 'https://ddborder.homeinfo.de/deployments',
        dataType: 'json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    }).then(deployments => {
        DEPLOYMENTS = deployments;
        return deployments;
    });
}


/*
    Yield deployments that match the filtering criteria.
*/
export function * filterDeployments () {
    for (const deployment of DEPLOYMENTS) {
        if (matchDeployment(
            deployment, getSelectedCustomerId(), $('#street').val(),
            $('#houseNumber').val(), $('#zipCode').val(), $('#city').val()
        ))
            yield deployment;
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