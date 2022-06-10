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
    if (jqXHR.responseJSON != null && jqXHR.responseJSON.message != null) {
        switch (jqXHR.responseJSON.message) {
        case 'Systems are already deployed here.':
            Swal.fire({
                icon: 'error',
                title: 'Standort kann nicht gelöscht werden.',
                text: 'An diesem Standort sind bereits Systeme verbaut.'
            });
            return;
        }
    }

    Swal.fire({
        icon: 'error',
        title: textStatus,
        text: errorThrown,
        footer: '<pre>' + JSON.stringify(jqXHR, null, 2) + '</pre>'
    })
}


/*
    Return a span that is clickable and has a text.
*/
export function makeSpanLink (caption, action) {
    const span = document.createElement('span');
    span.style.textDecoration = 'underline';
    span.style.cursor = 'pointer';
    span.addEventListener('click', action);
    span.textContent = caption;
    return span;
}


/*
    Compare two strings for sorting.
*/
export function compareStrings (lhs, rhs, descending) {
    if (lhs == rhs)
        return 0;

    if (lhs < rhs)
        return descending ? 1 : -1;

    return descending ? -1 : 1;
}

/*
    Compare two integers for sorting.
*/
export function compareIntegers (lhs, rhs, descending) {
    return (lhs - rhs) * (descending ? -1 : 1);
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
