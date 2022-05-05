/*
  common.mjs - Common JavaScript library.

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
    Delayed jobs manager.
*/
export class DelayedJobs {
    constructor () {
        this.jobs = {};
    }

    reschedule (name, action, delay = 1000) {
        const pending = this.jobs[name];

        if (pending != null)
            clearTimeout(pending);

        this.jobs[name] = setTimeout(action, delay);
    }
}


/*
    Return true iff the customer ID is null or the customer ID matches the
    deployment's customer ID.
*/
export function matchCustomerId (customerId, deployment) {
    if (customerId == null)
        return true;

    return deployment.customer.id == customerId;
}


/*
    Return true iff substring is null or if substring is a substring of string
    while checking case-insensitively.
*/
export function isSubstrNocasematchOrNull (substring, string) {
    if (substring == null)
        return true;

    return isSubstrNocasematch(substring, string);
}


/*
    Convert an iterable into a HTML list.
*/
export function toHTMLList (items, type = 'ul') {
    const list = document.createElement(type);
    let element = null;

    for (const item of items) {
        element = document.createElement('li');
        element.textContent = item;
        list.appendChild(element);
    }

    return list;
}


/*
    Handle generic Ajax Query errors.
*/
export function handleError (jqXHR, textStatus, errorThrown) {
    Swal.fire({
        icon: 'error',
        title: textStatus,
        text: errorThrown,
        footer: '<pre>' + JSON.stringify(jqXHR, null, 2) + '</pre>'
    })
}


/*
    Return true iff the first string is a substring of the second string with
    both strings being converted to lower case beforehand with case-insensitive
    matching.
*/
function isSubstrNocasematch (substring, string) {
    substring = substring.trim().toLowerCase();
    string = string.toLowerCase();

    if (substring.length > string.length)
        return false;

    return string.substring(0, substring.length) == substring;
}