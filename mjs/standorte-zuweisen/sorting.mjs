/*
  sorting.mjs - Deployment sorting.

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
    Initialize the sort buttons.
*/
export function initSortElements (action) {
    for (const element of getSortElements())
        initSortElement(element, action);
}


/*
    Sort deployments.
*/
export function sortedDeployments (deployments) {
    deployments = Array.from(deployments);
    deployments.sort(getSortFunction())
    return deployments;
}


/*
    Return a sorting function.
*/
function getSortFunction () {
    const sortParameters = getSortParameters();

    if (sortParameters == null)
        return (lhs, rhs) => { lhs.id - rhs.id; };

    switch (sortParameters.option) {
    case 'sort-deployment-by-street-and-house-number':
        return sortByStreetAndHouseNumber(sortParameters.descending);
    case 'sort-deployment-by-zip-code-and-city':
        return sortByZipCodeAndCity(sortParameters.descending);
    case 'sort-deployment-by-customer':
        return sortByCustomer(sortParameters.descending);
    case 'sort-deployment-by-systems':
        return sortBySystems(sortParameters.descending);
    };
}


/*
    Return the sort option elements.
*/
function getSortElements () {
    return document.getElementsByClassName('deployment-sort-option');
}


/*
    Return the sort parameters.
*/
function getSortParameters () {
    let mode = null;

    for (const sortOption of getSortElements()) {
        direction = getDirection(sortOption);

        if (direction)
            return {
                option: sortOption.getAttribute('id'),
                descending: direction == '⇩'
            };
    }

    return null;
}


function sortByStreetAndHouseNumber (descending) {
    return (lhs, rhs) => {
        return compareStrings(
            lhs.address.streetAndHouseNumber,
            rhs.address.streetAndHouseNumber,
            descending
        );
    };
}


function sortByZipCodeAndCity (descending) {
    return (lhs, rhs) => {
        return compareStrings(
            lhs.address.zipCodeAndCity,
            rhs.address.zipCodeAndCity,
            descending
        );
    };
}


function sortByCustomer (descending) {
    return (lhs, rhs) => {
        return compareStrings(
            lhs.customer.abbreviation,
            rhs.customer.abbreviation,
            descending
        );
    };
}


function sortBySystems (descending) {
    return (lhs, rhs) => {
        return compareIntegers(
            lhs.systems.length,
            rhs.systems.length,
            descending
        );
    };
}


function getSortIndicators (element) {
    return element.getElementsByClassName('sort-direction');
}


function toggleSortIndicator (element) {
    if (element.textContent == '⇧')
        element.textContent = '⇩';
    else
        element.textContent = '⇧';
}


function getDirection (element) {
    for (const sortIndicator of getSortIndicators(element))
        return sortIndicator.textContent;
}


function resetSortElement (element) {
    element.style.textDecoration = '';

    for (const sortIndicator of getSortIndicators(element))
        sortIndicator.textContent = '';
}


/*
    Handle sorting events.
*/
function onSort (action) {
    return event => {
        for (const element of getSortElements())
            if (element != event.target)
                resetSortElement(element);

        event.target.style.textDecoration = 'underline';

        for (const sortIndicator of getSortIndicators(event.target))
            toggleSortIndicator(sortIndicator);

        return action();
    };
}


/*
    Initialize a sort element.
*/
function initSortElement (element, action) {
    element.addEventListener('click', onSort(action));
    element.style.cursor = 'pointer';
}
