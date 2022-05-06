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


import { handleError, makeSpanLink } from '../common.mjs';
import { Pager } from '../pager.mjs';


const PAGE_SIZE = 15;
let DEPLOYMENTS = [];
let PAGER = null;


export class Deployment {
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
            json.customer,
            json.type,
            json.connection,
            json.address,
            json.lptAddress,
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
        input.addEventListener('click', selectDeployment);
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


export function init () {
    return getDeployments().then(render).then(() => {
        $('#find-deployment').keyup(render);
    });
}


/*
    Retrieve all available deployments.
*/
function getDeployments () {
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
    Return information about the current page and total amount of pages.
*/
function pageInfo () {
    return (PAGER.currentIndex + 1) + ' / ' + PAGER.pages;
}


/*
    Create the list of page links.
*/
function createPageLinks () {
    $('#deployment-pages').html('');
    const previous = makeSpanLink('<<', event => {
        renderDeployments(PAGER.previous());
        $('#deployment-page-info').text(PAGER.pageInfo);
    });
    $('#deployment-pages').append(previous);
    $('#deployment-pages').append('&nbsp;');
    const pageinfo = document.createElement('span');
    pageinfo.setAttribute('id', 'deployment-page-info');
    pageinfo.textContent = PAGER.pageInfo;
    $('#deployment-pages').append(pageinfo);
    $('#deployment-pages').append('&nbsp;');
    const next = makeSpanLink('>>', event => {
        renderDeployments(PAGER.next());
        $('#deployment-page-info').text(PAGER.pageInfo);
    });
    $('#deployment-pages').append(next);
}


/*
    Render the systems of the given deployment.
*/
function renderDeployedSystems (deployment) {
    $('#deployed-systems').html('');

    for (const system of deployment.systemsToHTML())
        $('#deployed-systems').append(system);
}


/*
    Return a deployment by its ID.
*/
function getDeploymentById (id) {
    for (const deployment of DEPLOYMENTS)
        if (deployment.id == id)
            return deployment;

    throw 'No such deployment.';
}


/*
    Handle event of deployment selection.
*/
function selectDeployment (event) {
    renderDeployedSystems(getDeploymentById(
        parseInt(event.target.getAttribute('data-id'))
    ));
}


/*
    Render the given deployments.
*/
function renderDeployments (deployments) {
    $('#deployments').html('');
    $('#deployed-systems').html('');

    for (const deployment of deployments)
        $('#deployments').append(deployment.toHTML());
}


/*
    Rebuild the paged list.
*/
function render () {
    PAGER = new Pager(filteredDeployments(), PAGE_SIZE);
    createPageLinks();
    renderDeployments(PAGER.currentPage());
}