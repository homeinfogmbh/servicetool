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


export class Deployment {
    constructor (
        id, customer, type, connection, address, lptAddress, scheduled,
        annotation, testing, timestamp
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
    }
}