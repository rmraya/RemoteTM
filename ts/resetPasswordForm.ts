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
import { RemoteTM } from "./remotetm";
import { View } from "./view";

export class ResetPasswordForm implements View {

    container: HTMLDivElement;
    dialog: Dialog;
    userName: HTMLInputElement;
    email: HTMLInputElement;

    constructor() {

        let mainContent: HTMLDivElement = document.getElementById('mainContent') as HTMLDivElement;

        this.container  = document.createElement('div');
        this.container.classList.add('fullWidth');
        this.container.classList.add('fullHeight');
        this.container.classList.add('bg');
        mainContent.appendChild(this.container);

        this.dialog = new Dialog(400);
        this.dialog.setTitle('Password Reset');
        this.dialog.canClose(false);

        let table: HTMLTableElement = document.createElement('table');
        table.classList.add('fullWidth');
        let row: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(row);

        let td: HTMLTableCellElement = document.createElement('td');
        td.classList.add('middle');
        let userLabel: HTMLLabelElement = document.createElement('label');
        userLabel.innerText = 'User Name';
        td.appendChild(userLabel);
        row.appendChild(td);

        td = document.createElement('td');
        td.classList.add('fullWidth');
        td.classList.add('middle');
        this.userName = document.createElement('input');
        this.userName.type = 'text';
        this.userName.classList.add('fullWidth');
        td.appendChild(this.userName);
        row.appendChild(td);

        row = document.createElement('tr');
        table.appendChild(row);

        td = document.createElement('td');
        td.classList.add('middle');
        let emailLabel: HTMLLabelElement = document.createElement('label');
        emailLabel.innerText = 'Email';
        td.appendChild(emailLabel);
        row.appendChild(td);

        td = document.createElement('td');
        td.classList.add('fullWidth');
        td.classList.add('middle');
        this.email = document.createElement('input');
        this.email.type = 'text';
        this.email.classList.add('fullWidth');
        td.appendChild(this.email);
        row.appendChild(td);

        this.dialog.addChild(table);

        let reset: HTMLButtonElement = document.createElement('button');
        reset.innerText = 'Reset Password';
        reset.addEventListener('click', () => {
            this.resetPassword();
        });
        this.dialog.addButton(reset);
    }

    show(): void {
        this.container.classList.remove('hidden');
        this.container.classList.add('block');
        this.dialog.open();
    }

    close(): void {
        this.container.classList.remove('block');
        this.container.classList.add('hidden');
        this.dialog.close();
    }

    resize(): void {
        // TODO
    }

    resetPassword(): void {
        if (this.userName.value === '' && this.email.value === '') {
            return;
        }
        if (this.userName.value === '') {
            RemoteTM.alert('Enter user name');
            return;
        }
        if (this.email.value === '') {
            RemoteTM.alert('Enter email address');
            return;
        }
        var json: any = { username: this.userName.value, email: this.email.value };

        var req = new XMLHttpRequest();
        req.open('POST', RemoteTM.getMainURL() + '/login/sendReminder', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('Accept', 'application/json');
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var json = JSON.parse(req.responseText);
                    if (json.status === 'OK') {
                        RemoteTM.showLogin();
                        RemoteTM.alert('If entered data matches our records, an email with password change information will be sent.');
                    } else {
                        RemoteTM.alert(json.reason);
                    }
                } else if (req.status == 401) {
                    RemoteTM.alert('Access denied');
                } else {
                    RemoteTM.alert('Server status: ' + req.status
                        + '. Try again later.');
                }
            }
        };
        req.send(JSON.stringify(json));
    }
}