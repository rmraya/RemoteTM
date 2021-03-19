/*******************************************************************************
Copyright (c) 2008-2021 - Maxprograms,  http://www.maxprograms.com/

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to compile, 
modify and use the Software in its executable form without restrictions.

Redistribution of this Software or parts of it in any form (source code or 
executable binaries) requires prior written permission from Maxprograms.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
*******************************************************************************/

import { Dialog } from "./dialog";

export class UsersManager {

    dialog: Dialog;
    tbody: HTMLTableSectionElement;

    constructor() {
        this.dialog = new Dialog(700);
        this.dialog.setTitle('Manage Users');

        let toolbar: HTMLDivElement = document.createElement('div');
        toolbar.classList.add('toolbar');
        this.dialog.appendChild(toolbar);

        let addUser: HTMLAnchorElement = document.createElement('a');
        addUser.innerText = 'Add User';
        toolbar.appendChild(addUser);

        let editUser: HTMLAnchorElement = document.createElement('a');
        editUser.innerText = 'Edit User';
        toolbar.appendChild(editUser);

        let removeUser: HTMLAnchorElement = document.createElement('a');
        removeUser.innerText = 'Remove User';
        toolbar.appendChild(removeUser);

        let lockUser: HTMLAnchorElement = document.createElement('a');
        lockUser.innerText = 'Lock User';
        toolbar.appendChild(lockUser);

        let tableContainer: HTMLDivElement = document.createElement('div');
        tableContainer.classList.add('fullWidth');
        tableContainer.classList.add('divContainer');
        tableContainer.style.height = '300px';
        this.dialog.appendChild(tableContainer);

        let mainTable: HTMLTableElement = document.createElement('table');
        mainTable.classList.add('fullWidth');
        tableContainer.appendChild(mainTable);

        let tableHeader: HTMLTableSectionElement = document.createElement('thead');
        mainTable.appendChild(tableHeader);

        let headerRow: HTMLTableRowElement = document.createElement('tr');
        tableHeader.appendChild(headerRow);

        let userIdTh: HTMLTableHeaderCellElement = document.createElement('th');
        userIdTh.innerText = 'User ID';
        headerRow.appendChild(userIdTh);

        let nameTh: HTMLTableHeaderCellElement = document.createElement('th');
        nameTh.innerText = 'Name';
        headerRow.appendChild(nameTh);

        let emailTh: HTMLTableHeaderCellElement = document.createElement('th');
        emailTh.innerText = 'Email';
        headerRow.appendChild(emailTh);

        let roleTh: HTMLTableHeaderCellElement = document.createElement('th');
        roleTh.innerText = 'Role';
        headerRow.appendChild(roleTh);

        let activeTh: HTMLTableHeaderCellElement = document.createElement('th');
        activeTh.innerText = 'Active';
        headerRow.appendChild(activeTh);

        this.tbody = document.createElement('tbody');
        mainTable.appendChild(this.tbody);
    }

    open(): void {
        this.dialog.open();
    }
}