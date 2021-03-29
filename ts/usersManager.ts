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

import { AddUser } from "./adduser";
import { Dashboard } from "./dashboard";
import { Dialog } from "./dialog";
import { EditUser } from "./editUSer";
import { Message } from "./message";
import { RemoteTM } from "./remotetm";

export class UsersManager {

    dialog: Dialog;
    tbody: HTMLTableSectionElement;
    selected: string;
    parent: Dashboard;

    constructor(parent: Dashboard) {
        this.parent = parent;

        this.selected = '';
        this.dialog = new Dialog(850);
        this.dialog.position(84, 84);
        this.dialog.setTitle('Manage Users');

        let toolbar: HTMLDivElement = document.createElement('div');
        toolbar.classList.add('toolbar');
        this.dialog.appendChild(toolbar);

        let addUser: HTMLButtonElement = document.createElement('button');
        addUser.innerText = 'Add User';
        addUser.addEventListener('click', () => { this.addUser(); });
        toolbar.appendChild(addUser);

        let editUser: HTMLButtonElement = document.createElement('button');
        editUser.innerText = 'Edit User';
        editUser.addEventListener('click', () => { this.editUser(); });
        toolbar.appendChild(editUser);

        let removeUser: HTMLButtonElement = document.createElement('button');
        removeUser.innerText = 'Remove User';
        removeUser.addEventListener('click', () => { this.removeUser(); });
        toolbar.appendChild(removeUser);

        let lockUser: HTMLButtonElement = document.createElement('button');
        lockUser.innerText = 'Lock/Unlock User';
        lockUser.addEventListener('click', () => { this.lockUser(); });
        toolbar.appendChild(lockUser);

        let tableContainer: HTMLDivElement = document.createElement('div');
        tableContainer.classList.add('fullWidth');
        tableContainer.classList.add('divContainer');
        tableContainer.style.height = '300px';
        this.dialog.appendChild(tableContainer);

        let mainTable: HTMLTableElement = document.createElement('table');
        mainTable.classList.add('fullWidth');
        mainTable.classList.add('stripes');
        tableContainer.appendChild(mainTable);

        let tableHeader: HTMLTableSectionElement = document.createElement('thead');
        mainTable.appendChild(tableHeader);

        let headerRow: HTMLTableRowElement = document.createElement('tr');
        tableHeader.appendChild(headerRow);

        let userIdTh: HTMLTableHeaderCellElement = document.createElement('th');
        userIdTh.innerText = 'ID';
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

        this.loadUsers();
    }

    open(): void {
        this.dialog.open();
    }

    loadUsers(): void {
        fetch(RemoteTM.getMainURL() + '/users', {
            method: 'get',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ]
        }).then(async (response: Response) => {
            let json: any = await response.json();
            if (json.status === 'OK') {
                this.tbody.innerHTML = '';
                this.selected = '';
                let array: any[] = json.users;
                let length: number = array.length;
                for (let i = 0; i < length; i++) {
                    let user: any = array[i];
                    let tr: HTMLTableRowElement = document.createElement('tr');
                    tr.id = 'u_' + user.id;
                    tr.addEventListener('click', () => { this.setSelected(user.id) });
                    this.tbody.appendChild(tr);

                    let td: HTMLTableCellElement = document.createElement('td');
                    td.innerText = user.id;
                    tr.appendChild(td);

                    td = document.createElement('td');
                    td.innerText = user.name;
                    tr.appendChild(td);

                    td = document.createElement('td');
                    td.innerText = user.email;
                    tr.appendChild(td);

                    td = document.createElement('td');
                    td.innerText = this.getRole(user.role);
                    tr.appendChild(td);

                    td = document.createElement('td');
                    td.classList.add('center');
                    td.innerText = user.active ? 'Yes' : 'No';
                    tr.appendChild(td);
                }
            } else {
                new Message(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    setSelected(id: string): void {
        let selectedRows: HTMLCollectionOf<Element> = this.tbody.getElementsByClassName('selected');
        let length: number = selectedRows.length;
        for (let i = 0; i < length; i++) {
            selectedRows[i].classList.remove('selected');
        }
        if (this.selected === id) {
            this.selected = '';
            return;
        }
        document.getElementById('u_' + id).classList.add('selected');
        this.selected = id;
    }

    getRole(role: string): string {
        switch (role) {
            case 'SA': return 'System Administrator';
            case 'PM': return 'Project Manager';
            case 'TR': return 'Translator';
            default: return undefined;
        }
    }

    addUser(): void {
        let addDialog: AddUser = new AddUser(this);
        addDialog.open();
    }

    editUser(): void {
        if (!this.selected) {
            new Message('Select user');
            return;
        }
        let editDialog: EditUser = new EditUser(this, this.selected);
        editDialog.open();
    }

    removeUser(): void {
        if (!this.selected) {
            new Message('Select user');
            return;
        }
        let params: any = {
            command: 'removeUser',
            id: this.selected
        }
        fetch(RemoteTM.getMainURL() + '/users', {
            method: 'POST',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ],
            body: JSON.stringify(params)
        }).then(async (response: Response) => {
            let json: any = await response.json();
            if (json.status === 'OK') {
                this.loadUsers();
            } else {
                new Message(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    lockUser(): void {
        if (!this.selected) {
            new Message('Select user');
            return;
        }
        let params: any = {
            command: 'toggleLock',
            id: this.selected
        }
        fetch(RemoteTM.getMainURL() + '/users', {
            method: 'POST',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ],
            body: JSON.stringify(params)
        }).then(async (response: Response) => {
            let json: any = await response.json();
            if (json.status === 'OK') {
                this.loadUsers();
            } else {
                new Message(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    setStatus(status: string): void {
        this.parent.setStatus(status);
    }
}