/*
  address.mjs - Address library.

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


export class Address {
    constructor (id, street, houseNumber, zipCode, city, district = null) {
        this.id = id;
        this.street = street;
        this.houseNumber = houseNumber;
        this.zipCode = zipCode;
        this.city = city;
        this.district = district;
    }

    static fromJSON (json) {
        return new this(
            json.id,
            json.street,
            json.houseNumber,
            json.zipCode,
            json.city,
            json.district || null
        );
    }

    get streetAndHouseNumber () {
        return this.street + ' ' + this.houseNumber;
    }

    get zipCodeAndCity () {
        return this.zipCode + ' ' + this.city;
    }

    toString () {
        return this.streetAndHouseNumber + ', ' + this.zipCodeAndCity;
    }
}
