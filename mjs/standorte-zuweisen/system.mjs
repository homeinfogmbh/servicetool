/*
  system.mjs - Systems library.

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
import { Deployment, openSystemDetails } from './deployment.mjs';


const PAGE_SIZE = 10;
let SYSTEMS = [];
let PAGER = null;


export function init () {
    return getSystems().then(render).then(() => {
        $('#find-system').keyup(render);
    });
}


/*
    Rebuild the paged list.
*/
export function render () {
    PAGER = new Pager(filteredSystems(), PAGE_SIZE);
    createPageLinks();
    renderSystems(PAGER.currentPage());
}


function getSystems () {
    return $.ajax({
        url: 'https://termgr.homeinfo.de/list/systems',
        dataType: 'json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    }).then(json => {
        const systems = [];

        for (const system of json)
            systems.push(System.fromJSON(system));

        systems.sort(System.sortById(true));
        SYSTEMS = systems;
        return systems;
    });
}


class System {
    constructor (
        id, group, deployment, dataset, openvpn, ipv6address, pubkey,
        created, configured, fitted, operatingSystem, monitor, serialNumber,
        model, lastSync
    ) {
        this.id = id;
        this.group = group;
        this.deployment = deployment;
        this.dataset = dataset;
        this.openvpn = openvpn;
        this.ipv6address = ipv6address;
        this.pubkey = pubkey;
        this.created = created;
        this.configured = configured;
        this.fitted = fitted;
        this.operatingSystem = operatingSystem;
        this.monitor = monitor;
        this.serialNumber = serialNumber;
        this.model = model;
        this.lastSync = lastSync;
     }

    static fromJSON (json) {
        return new this(
            json.id,
            json.group,
            (json.deployment == null) ? null : Deployment.fromJSON(json.deployment),
            (json.dataset == null) ? null : Deployment.fromJSON(json.dataset),
            json.openvpn,
            json.ipv6address,
            json.pubkey,
            (json.created == null) ? null : new Date(json.created),
            (json.configured == null) ? null : new Date(json.configured),
            json.fitted,
            json.operatingSystem,
            json.monitor,
            json.serialNumber,
            json.model,
            (json.lastSync == null) ? null : new Date(json.lastSync)
        );
    }

    static sortById (descending) {
        return (lhs, rhs) => {
            if (lhs.id == rhs.id)
                return 0;

            return (lhs.id - rhs.id) * (descending ? -1 : 1);
        };
    }

    toHTML () {
        const li = document.createElement('li');
        const input = document.createElement('input');
        input.setAttribute('type', 'radio');
        input.setAttribute('name', 'system-select');
        input.setAttribute('id', 'system-' + this.id);
        input.setAttribute('data-id', this.id);
        input.style.display = 'none';
        li.appendChild(input);
        const label = document.createElement('label');
        label.setAttribute('for', 'system-' + this.id);
        span1.setAttribute('data-id', this.id);
        label.style.textDecoration = 'underline';
        label.style.cursor = 'pointer';
        label.textContent = this.id;
        label.addEventListener('click', openSystemDetails);
        li.appendChild(label);
        const span = document.createElement('span');
        span.classList.add('radioCircle');
        li.appendChild(span);
        return li;
    }
}


/*
    Parse the search string and return a tuple
    of the all flag and the target ID.
*/
function parseSearchString (string) {
    string = string.trim()
    let all = false;
    let id = null;

    if (string.startsWith('a:')) {
        all = true;
        string = string.substring(2);
    }

    string = string.trim();

    if (string.length > 0)
        id = parseInt(string.trim());

    return [all, id];
}


/*
    Match a system against the all flag and an ID.
*/
function matchSystem (system, all, id) {
    if (system.deployment != null && !all)
        return false;

    return id == null || system.id == id;
}


/*
    Yield filtered systems.
*/
function * filteredSystems () {
    const [all, id] = parseSearchString($('#find-system').val().trim());

    for (const system of SYSTEMS)
        if (matchSystem(system, all, id))
            yield system;
}


/*
    Create the list of page links.
*/
function createPageLinks () {
    $('#system-pages').html('');
    const previous = makeSpanLink('<<', event => {
        renderSystems(PAGER.previous());
        $('#system-page-info').text(PAGER.pageInfo);
    });
    $('#system-pages').append(previous);
    $('#system-pages').append('&nbsp;');
    const pageinfo = document.createElement('span');
    pageinfo.setAttribute('id', 'system-page-info');
    pageinfo.textContent = PAGER.pageInfo;
    $('#system-pages').append(pageinfo);
    $('#system-pages').append('&nbsp;');
    const next = makeSpanLink('>>', event => {
        renderSystems(PAGER.next());
        $('#system-page-info').text(PAGER.pageInfo);
    });
    $('#system-pages').append(next);
}


/*
    Render the given deployments.
*/
function renderSystems (systems) {
    $('#systems').html('');

    for (const system of systems)
        $('#systems').append(system.toHTML());
}