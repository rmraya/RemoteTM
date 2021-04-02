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
import { Dialog } from "./dialog";
import { Input } from "./input";
import { Message } from "./message";
import { RemoteTM } from "./remotetm";
import { Select } from "./select";
import { UsersManager } from "./usersManager";

export class EditUser {

    parent: UsersManager
    userId: string;
    dialog: Dialog;
    userNameInput: Input;
    roleSelect: Select;
    emailInput: Input;

    constructor(parent: UsersManager, id: string) {
        this.parent = parent;
        this.userId = id;
        this.dialog = new Dialog(350);
        this.dialog.setTitle('Edit User');

        this.userNameInput = new Input(this.dialog.contentArea, 'Name', 'text');
        this.roleSelect = new Select(this.dialog.contentArea, 'Role');
        this.roleSelect.setOptions(AddUser.rolesList());
        this.emailInput = new Input(this.dialog.contentArea, 'Email', 'text');

        let button: HTMLButtonElement = document.createElement('button');
        button.innerText = 'Save';
        button.addEventListener('click', () => { this.addUser(); });
        this.dialog.addButton(button);

        fetch(RemoteTM.getMainURL() + '/users?id=' + this.userId, {
            method: 'GET',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ]
        }).then(async (response: Response) => {
            let json: any = await response.json();
            if (json.status === 'OK') {
               let user: any = json.user;
               this.userNameInput.setValue(user.name);
               this.roleSelect.setValue(user.role);
               this.emailInput.setValue(user.email);
            } else {
                new Message(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    open(): void {
        this.dialog.open();
    }

    addUser(): void {
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
            command: 'updateUser',
            id: this.userId,
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
}