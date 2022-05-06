/*
  pager.mjs - A pager to split iterables into pages of a maximum size.

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


export class Pager {
    constructor (iterable, pageSize = 15) {
        this.items = Array.from(iterable);
        this.pageSize = pageSize;
        this.currentIndex = 0;
    }

    get lastPageFull () {
        return this.items.length % this.pageSize == 0;
    }

    get pages () {
        return parseInt(this.items.length / this.pageSize) + (
            this.lastPageFull ? 0 : 1
        );
    }

    get pageInfo () {
        return (this.currentIndex + 1) + ' / ' + this.pages;
    }

    page (pageNumber) {
        if (pageNumber < 0)
            throw 'Invalid page number.';

        return this.items.slice(
            pageNumber * this.pageSize,
            (pageNumber + 1) * this.pageSize
        );
    }

    next () {
        this.currentIndex++;

        if (this.currentIndex >= this.pages)
            this.currentIndex = 0;

        return this.page(this.currentIndex);
    }

    previous () {
        this.currentIndex--;

        if (this.currentIndex < 0)
            this.currentIndex = this.pages - 1;

        return this.page(this.currentIndex);
    }

    currentPage () {
        return this.page(this.currentIndex);
    }
}