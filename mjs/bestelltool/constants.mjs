/*
  constants.mjs - Constants for the ordering subsystem.

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


export const ID_TO_MODEL = {
    'Touch24': 'Standard 24"',
    'Touch34': 'Standard 32"',
    'PhoenixTouch24': 'Phönix',
    'NeptunTouch24': 'Neptun',
    'model-other': 'other'
};

export const MODEL_TO_ID = {
    'Standard 24&quot;': 'Touch24',
    'Standard 32&quot;"': 'Touch34',
    'Phönix': 'PhoenixTouch24',
    'Neptun': 'NeptunTouch24',
    'other': 'model-other'
};

export const ID_TO_CONNECTION = {
    'ADSL': 'LANDSL',
    'lte3G4G': 'UMTS',
    'wlandsl': 'WLANDSL',
    'wlanlte': 'WLANLTE'
};

export const CONNECTION_TO_ID = {
    'LANDSL': 'ADSL',
    'UMTS': 'lte3G4G',
    'WLANDSL': 'wlandsl',
    'WLANLTE': 'wlanlte'
};

export const URL_PARAMS = new URLSearchParams(window.location.search);