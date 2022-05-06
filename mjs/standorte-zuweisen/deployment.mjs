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


import { Pager } from '../pager.mjs';


let DEPLOYMENTS = [];


/*
    Retrieve all available deployments.
*/
export function getDeployments () {
    return $.ajax({
        url: 'https://termgr.homeinfo.de/list/deployments',
        dataType: 'json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    }).then(json => {
        const deployments = [];

        for (const deployment of json)
            deployments.push(Deployment.fromJSON(deployment));

        DEPLOYMENTS = deployments;
        return deployments;
    });
}


class Deployment {
    constructor (
        id, customer, type, connection, address, lptAddress, scheduled,
        annotation, testing, timestamp, systems = null
    ) {
        this.id = id;
        this.customer = customer;
        this.type = type;
        this.connection = connection;
        this.address = address;
        this.lptAddress = lptAddress;
        this.scheduled = scheduled;
        this.annotation = annotation;
        this.testing = testing;
        this.timestamp = timestamp;
        this.systems = systems || [];
    }

    /*
        Create a Deployment instance from a JSON object.
    */
    static fromJSON (json) {
        return new this(
            json.id,
            Customer.fromJSON(json.customer),
            json.type,
            json.connection,
            Address.fromJSON(json.address),
            (json.lptAddress == null) ? null : Address.fromJSON(json.lptAddress),
            (json.scheduled == null) ? null : new Date(json.scheduled),
            json.annotation,
            json.testing,
            (json.timestamp == null) ? null : new Date(json.timestamp),
            json.systems || []
        );
    }

    /*
        Return a string containing the street name and house number.
    */
    get addressAndHouseNumber () {
        return this.address.street + ' ' + this.address.houseNumber;
    }

    /*
        Return a string containing the zip code and city.
    */
    get zipCodeAndCity () {
        return this.address.zipCode + ' ' + this.address.city;
    }

    /*
        Return an HTML element for the deployments list.
    */
    toHTML () {
        const tr = document.createElement('tr');
        const col1 = document.createElement('td');
        tr.appendChild(col1);
        const input = document.createElement('input');
        input.setAttribute('id', 'deployment-' + this.id);
        input.setAttribute('type', 'radio');
        input.setAttribute('name', 'deployment-select');
        input.setAttribute('data-id', this.id);
        input.style.display = 'none';
        col1.appendChild(input);
        const label = document.createElement('label');
        label.setAttribute('for', 'deployment-' + this.id);
        col1.appendChild(label);
        const span = document.createElement('span');
        span.classList.add('radioCircle');
        span.classList.add('blueCircle');
        label.appendChild(span);
        const col2 = document.createElement('td');
        col2.textContent = this.addressAndHouseNumber;
        tr.appendChild(col2);
        const col3 = document.createElement('td');
        col3.textContent = this.zipCodeAndCity;
        tr.appendChild(col3);
        const col4 = document.createElement('td');
        col4.textContent = this.customer.abbreviation;
        tr.appendChild(col4);
        const col5 = document.createElement('td');
        col5.classList.add('text-center');
        col5.textContent = this.systems.length;
        tr.appendChild(col5);
        return tr;
    }

    /*
        Yield HTML elements for the list of systems deployed at the currently
        selected deployment.
    */
    * systemsToHTML () {
        for (const systemId of this.systems)
            yield deployedSystemToHTML(systemId, this.id);
    }
}


function deployedSystemToHTML (systemId, deploymentId) {
    const li = document.createElement('li');
    const span1 = document.createElement('span');
    span1.textContent = systemId;
    li.appendChild(span1);
    const span2 = document.createElement('span');
    span2.setAttribute('data-system', systemId);
    span2.setAttribute('data-deployment', deploymentId);
    span2.classList.add('whiteMark');
    span2.classList.add('undeploy');
    span2.textContent = 'lösen';
    li.appendChild(span2);
    return li;
}


/*
    Return true iff the deployment matches the filter string.
*/
function deploymentMatchesFilter (deployment, filterString) {
    if (!filterString)
        return true;

    if (deployment.address.street.toLowerCase().includes(filterString))
        return true;

    if (deployment.address.city.toLowerCase().includes(filterString))
        return true;

    if (deployment.customer.abbreviation.toLowerCase().includes(filterString))
        return true;

    if (deployment.customer.id == parseInt(filterString))
        return true;

    return false;
}


/*
    Yield deployments that match the filter string.
*/
function * filteredDeployments () {
    const filterString = $('#find-deployment').val().toLowerCase();

    for (const deployment of DEPLOYMENTS)
        if (deploymentMatchesFilter(deployment, filterString))
            yield deployment;
}


/*
    Create the list of page links.
*/
function createPageLinks () {
    $('#deployment-pages').html('');
    const pager = new Pager(filteredDeployments(), 15);

    for (let index = 0; index < pager.pages; index++)
        $('#deployment-pages').append(createPageLink(index));
}


/*
    Render the page with the given index.
*/
function renderPage (index) {
    $('#deployments').html('');
    const pager = new Pager(filteredDeployments(), 15);
    const page = pager.page(index);

    for (const deployment of page)
        $('#deployments').append(deployment.toHTML());
}


/*
    Event handler to open a page.
*/
function openPage (event) {
    renderPage(parseInt(event.target.getAttribute('data-page')));
}


/*
    Create a HTML element for the link to the given page number.
*/
function createPageLink (index) {
    const span = document.createElement('span');
    span.textContent = index + 1;
    span.setAttribute('data-page', index);
    span.classList.add('deployment-page');
    span.addEventListener('click', openPage);
    return span;
}