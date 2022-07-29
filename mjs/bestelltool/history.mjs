/*
  history.mjs - Order history.

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
    Render history.
*/
export function renderHistory (deployment) {
    const historyItems = Array.from(HistoryItem.fromDeployment(deployment));
    historyItems.sort((lhs, rhs) => {
        return lhs.timestamp - rhs.timestamp;
    });

    for (const historyItem of historyItems)
        $('#history').append(historyItem.toHTML());
}


/*
    Container for history item information.
*/
class HistoryItem {
    constructor (caption, timestamp) {
        this.caption = caption;
        this.timestamp = timestamp;
    }

    static * fromDeployment (deployment) {
        if (deployment.constructionSitePreparationFeedback != null)
            yield new this(
                'Anlage Baustellenvorbeitung erledigt',
                new Date(deployment.constructionSitePreparationFeedback)
            );

        if (deployment.internetConnection != null)
            yield new this(
                'Netzanbindung erfolgt',
                new Date(deployment.internetConnection)
            );
    }

    get timestampColumn () {
        const col = document.createElement('td');
        col.classList.add('w130');
        col.textContent = (
            this.timestamp.getDate()
            + '.'
            + (this.timestamp.getMonth() + 1)
            + '.'
            + this.timestamp.getFullYear()
        );
        return col;
    }

    get captionColumn () {
        const col = document.createElement('td');
        col.textContent = this.caption;
        return col;
    }

    toHTML () {
        const tr = document.createElement('tr');
        tr.appendChild(this.timestampColumn);
        tr.appendChild(this.captionColumn);
        return tr;
    }
}