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


import { Deployment } from './deployment.mjs';


export function getSystems () {
    return $.ajax({
        url: 'https://termgr.homeinfo.intra/list/systems',
        dataType: 'json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    }).then(json => {
        const systems = [];

        for (const system of json)
            systems.push(System.fromJSON(system));

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
}