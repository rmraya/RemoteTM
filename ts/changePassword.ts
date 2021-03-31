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

import { Dashboard } from "./dashboard";
import { Dialog } from "./dialog";
import { Input } from "./input";
import { Message } from "./message";
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
            new Message('Enter current password');
            return;
        }
        let newPassword: string = this.newInput.getValue();
        if (!newPassword) {
            new Message('Enter new password');
            return;
        }
        let repeat: string = this.repeatInput.getValue();
        if (!repeat) {
            new Message('Repeat new password');
            return;
        }
        if (newPassword !== repeat) {
            new Message('Different passwords');
            return;
        }
        if (PasswordReset.isWeak(newPassword)) {
            new Message('Weak passwords');
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
                new Message('Password changed');
                this.parent.signOut();
            } else {
                new Message(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }
}