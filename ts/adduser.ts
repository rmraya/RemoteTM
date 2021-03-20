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
import { Input } from "./input";
import { Message } from "./message";
import { RemoteTM } from "./remotetm";
import { Select } from "./select";
import { UsersManager } from "./usersManager";

export class AddUser {

    parent: UsersManager
    dialog: Dialog;
    userIdInput: Input;
    userNameInput: Input;
    roleSelect: Select;
    emailInput: Input;

    constructor(parent: UsersManager) {
        this.parent = parent;
        this.dialog = new Dialog(350);
        this.dialog.setTitle('Add User');

        this.userIdInput = new Input(this.dialog.contentArea, 'User ID', 'text');
        this.userNameInput = new Input(this.dialog.contentArea, 'Name', 'text');
        this.roleSelect = new Select(this.dialog.contentArea, 'Role');
        this.roleSelect.setOptions(this.rolesList());
        this.emailInput = new Input(this.dialog.contentArea, 'Email', 'text');

        let button: HTMLButtonElement = document.createElement('button');
        button.innerText = 'Add User';
        button.addEventListener('click', () => { this.addUser(); });
        this.dialog.addButton(button);
    }

    open(): void {
        this.dialog.open();
    }

    addUser(): void {
        let id: string = this.userIdInput.getValue();
        if (!id) {
            new Message('Enter user ID');
            return;
        }
        let name: string = this.userNameInput.getValue();
        if (!name) {
            new Message('Enter name');
            return;
        }
        let role: string = this.roleSelect.getValue();
        if (!role) {
            new Message('Select role');
            return;
        }
        let email: string = this.emailInput.getValue();
        if (!email) {
            new Message('Enter email');
            return;
        }
        let params: any = {
            command: 'addUser',
            id: id,
            name: name,
            role: role,
            email: email
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
                this.parent.loadUsers();
                this.dialog.close();
            } else {
                new Message(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    rolesList(): HTMLOptionElement[] {
        let roles: HTMLOptionElement[] = [];

        let sa: HTMLOptionElement = document.createElement('option');
        sa.value = 'SA';
        sa.innerText = 'System Administrator';
        roles.push(sa);

        let pm: HTMLOptionElement = document.createElement('option');
        pm.value = 'PM';
        pm.innerText = 'Project Manager';
        roles.push(pm);

        let tr: HTMLOptionElement = document.createElement('option');
        tr.value = 'TR';
        tr.innerText = 'Translator';
        roles.push(tr);

        return roles;
    }
}