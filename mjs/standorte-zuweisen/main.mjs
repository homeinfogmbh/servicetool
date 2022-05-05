/*
  main.mjs - Main JavaScript module for system deployment.

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


const DEPLOYMENTS_PAGE_SIZE = 15;


/*
    Retrieve all available deployments.
*/
function getDeployments () {
    return $.ajax({
        url: 'https://termgr.homeinfo.de/list/deployments',
        dataType: 'json',
        error: handleError,
        xhrFields: {
            withCredentials: true
        }
    });
}


