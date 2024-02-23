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

import { Dashboard } from "./dashboard";
import { Dialog } from "./dialog";
import { Input } from "./input";
import { PasswordReset } from "./passwordReset";
import { RemoteTM } from "./remotetm";

export class ChangePasswordDialog {

    parent: Dashboard;
    dialog: Dialog;
    currentInput: Input;
    newInput: Input;
    repeatInput: Input;

    constructor(parent: Dashboard) {
        this.parent = parent;

        this.dialog = new Dialog(350);
        this.dialog.setTitle('Change Password');

        this.currentInput = new Input(this.dialog.contentArea, 'Current Password', 'password');
        this.newInput = new Input(this.dialog.contentArea, 'New Password', 'password');
        this.repeatInput = new Input(this.dialog.contentArea, 'Repeat Password', 'password');

        let changePassword: HTMLButtonElement = document.createElement('button');
        changePassword.innerText = 'Change Password';
        changePassword.addEventListener('click', () => { this.changePassword(); });
        this.dialog.addButton(changePassword);
    }

    open(): void {
        this.dialog.open();
    }

    changePassword(): void {
        let current: string = this.currentInput.getValue();
        if (!current) {
            RemoteTM.showMessage('Enter current password');
            return;
        }
        let newPassword: string = this.newInput.getValue();
        if (!newPassword) {
            RemoteTM.showMessage('Enter new password');
            return;
        }
        let repeat: string = this.repeatInput.getValue();
        if (!repeat) {
            RemoteTM.showMessage('Repeat new password');
            return;
        }
        if (newPassword !== repeat) {
            RemoteTM.showMessage('Different passwords');
            return;
        }
        if (PasswordReset.isWeak(newPassword)) {
            RemoteTM.showMessage('Weak passwords');
            return;
        }
        let params: any = {
            command: 'changePassword',
            current: current,
            newPassword: newPassword
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
                RemoteTM.showMessage('Password changed');
                this.parent.signOut();
            } else {
                RemoteTM.showMessage(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }
}