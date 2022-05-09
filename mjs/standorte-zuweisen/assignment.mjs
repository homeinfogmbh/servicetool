/*
  assignment.mjs - Assignment of systems to deployments.

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


import { handleError, toHTMLList } from '../common.mjs';
import { render } from './system.mjs';


/*
    Initialize the assignment subsystem.
*/
export function init () {
    $('#deploy-system').click(assign);
}


/*
    Assign the selected display to the selected deployment.
*/
function assign (event) {
    const assignment = getAssignment();

    if (!validateAssignment(assignment))
        return Promise.reject('Fehlende Daten.');

    return $.ajax({
        url: 'https://termgr.homeinfo.de/administer/deploy',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(assignment),
        dataType: 'json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    }).then(response => {
        window.location.reload();
    });
}


/*
    Validate completeness of assignment information.
*/
function validateAssignment (assignment) {
    const issues = [];

    if (assignment.deployment == null || isNaN(assignment.deployment))
        issues.push('Kein Standort ausgewählt.')

    if (assignment.system == null || isNaN(assignment.system))
        issues.push('Kein System ausgewählt.')

    if (issues.length == 0)
        return true;

    Swal.fire({
        icon: 'error',
        iconHtml: '<img src="assets/img/PopUp-Icon.png"></img>',
        title: 'Fehler',
        html: toHTMLList(issues),
        confirmButtonColor: '#0074A5'
    })
    return false;
}


/*
    Returns an assignment object.
*/
function getAssignment () {
    return {
        system: getSelectedSystem(),
        deployment: getSelectedDeployment()
    };
}


/*
    Return the selected system.
*/
function getSelectedSystem () {
    const id = $('input[name="system-select"]:checked').attr('data-id');
    return parseInt(id);
}


/*
    Return the selected deployment.
*/
function getSelectedDeployment () {
    const id = $('input[name="deployment-select"]:checked').attr('data-id');
    return parseInt(id);
}