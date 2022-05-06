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

    get addressAndHouseNumber () {
        return this.address.street + ' ' + this.address.houseNumber;
    }

    get zipCodeAndCity () {
        return this.address.zipCode + ' ' + this.address.city;
    }

    toHTML () {
        const tr = document.createElement('tr');
        const col1 = document.createElement('td');
        tr.appendChild(col1);
        const input = document.createElement('input');
        input.setAttribute('id', 'deployment-' + this.id);
        input.setAttribute('type', 'radio');
        input.setAttribute('name', 'deploymentSelect');
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
}
