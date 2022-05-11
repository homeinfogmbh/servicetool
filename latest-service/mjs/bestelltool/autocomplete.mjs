/*
  autocomplete.mjs - Address auto completion.

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


import { filterDeployments } from './deployments.mjs';


/*
    Re-generate the completion list.
*/
export function regenerateAutocompleteList (event) {
    removeAutocompleteList(event.target);
    createAutocompleteList(event.target);
}


/*
    Remove the auto completion list.
*/
export function removeAutocompleteList (textInput) {
    const parent = textInput.parentNode;

    for (const childNode of parent.childNodes)
        if (childNode.classList && childNode.classList.contains('autocomplete-items'))
            parent.removeChild(childNode);
}


/*
    Select an autocomplete item.
*/
function selectAutocompleteItem (event) {
    $('#street').val(event.target.getAttribute('data-street'));
    $('#houseNumber').val(event.target.getAttribute('data-house-number'));
    $('#zipCode').val(event.target.getAttribute('data-zip-code'));
    $('#city').val(event.target.getAttribute('data-city'));
    removeAutocompleteList(document.getElementById('street'));
}


/*
    Create a list item for the auto completion.
*/
function createAutocompleteListItem (address) {
    const div = document.createElement('div');
    div.classList.add('autocomplete-item');
    div.setAttribute('data-street', address.street);
    div.setAttribute('data-house-number', address.houseNumber);
    div.setAttribute('data-zip-code', address.zipCode);
    div.setAttribute('data-city', address.city);
    div.textContent = (
        address.street + ' ' + address.houseNumber
        + ', ' + address.zipCode + ' ' + address.city
    );
    div.addEventListener('click', selectAutocompleteItem);
    return div;
}


/*
    Create list with auto completion entries.
*/
function createAutocompleteList (textInput) {
    const list = document.createElement('div');
    list.classList.add('autocomplete-items');

    for (const deployment of filterDeployments())
        list.appendChild(createAutocompleteListItem(deployment.address));

    if (textInput.nextSibling)
        textInput.parentNode.insertBefore(list, textInput.nextSibling);
    else
        textInput.parentNode.appendChild(list);
}