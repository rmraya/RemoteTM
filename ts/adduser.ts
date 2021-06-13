/*******************************************************************************
 * Copyright (c) 2008-2021 Maxprograms.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 1.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/org/documents/epl-v10.html
 *
 * Contributors:
 *     Maxprograms - initial API and implementation
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
        this.roleSelect.setOptions(AddUser.rolesList());
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
        this.parent.setStatus('Adding user...');
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
            this.parent.setStatus('');
            if (json.status === 'OK') {
                this.parent.loadUsers();
                this.dialog.close();
            } else {
                new Message(json.reason);
            }
        }).catch((reason: any) => {
            this.parent.setStatus('');
            console.error('Error:', reason);
        });
    }

    static rolesList(): HTMLOptionElement[] {
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