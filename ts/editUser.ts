/*******************************************************************************
 * Copyright (c) 2008-2024 Maxprograms.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 1.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/org/documents/epl-v10.html
 *
 * Contributors:
 *     Maxprograms - initial API and implementation
 *******************************************************************************/

import { AddUser } from "./adduser";
import { Dialog } from "./dialog";
import { Input } from "./input";
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
                RemoteTM.showMessage(json.reason);
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
            RemoteTM.showMessage('Enter name');
            return;
        }
        let role: string = this.roleSelect.getValue();
        if (!role) {
            RemoteTM.showMessage('Select role');
            return;
        }
        let email: string = this.emailInput.getValue();
        if (!email) {
            RemoteTM.showMessage('Enter email');
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
                RemoteTM.showMessage(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }
}