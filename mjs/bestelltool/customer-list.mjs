/*
  customer-list.mjs - Customer list.

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
    Representation of customer list entries.
*/
export class CustomerListEntry {
    constructor (id, abbreviation) {
        this.id = id;
        this.abbreviation = abbreviation;
    }

    static compare (lhs, rhs) {
        if (lhs.abbreviation == rhs.abbreviation)
            return 0;

        if (lhs.abbreviation < rhs.abbreviation)
            return -1;

        return 1;
    }

    static fromJSON (json) {
        return new this(json.id, json.abbreviation);
    }

    toHTML () {
        const option = document.createElement('option')
        option.setAttribute('value', this.id);
        option.textContent = this.abbreviation;
        return option;
    }
}