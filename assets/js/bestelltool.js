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

let DEPLOYMENTS = [];


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
    Return a function to match an address against a street name.
*/
function matchStreet (street) {
    return address => {
        if (street == null)
            return true;

        return address.street == street.trim();
    };
}


/*
	Return a function to match an address against a house number.
*/
function matchHouseNumber (houseNumber) {
    return address => {
        if (houseNumber == null)
            return true;

        return address.houseNumber == houseNumber.trim();
    }
}


/*
    Group deployments by customer.
*/
function * filterDeployments (
    deployments, customerId, street, houseNumber, zipCode, city) {
    for (const deployment of deployments) {
        if (
            matchCustomerId(customerId)(deployment)
            && matchStreet(street)(deployment.address)
            && matchHouseNumber(houseNumber)(deployment.address)
            && matchZipCode(zipCode)(deployment.address)
            && matchCity(city)(deployment.address)
        ):
            yield deployment;
    }
}


/*
    Render page for a new order.
*/
function renderNewOrder () {
    getDeployments().then(deployments => {
        DEPLOYMENTS = deployments;
    });
}
