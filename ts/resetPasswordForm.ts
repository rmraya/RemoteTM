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
import { RemoteTM } from "./remotetm";
import { View } from "./view";

export class ResetPasswordForm implements View {

    container: HTMLDivElement;
    dialog: HTMLDivElement;
    userName: HTMLInputElement;
    email: HTMLInputElement;

    constructor() {

        let mainContent: HTMLDivElement = document.getElementById('mainContent') as HTMLDivElement;

        this.container = document.createElement('div');
        this.container.classList.add('fullWidth');
        this.container.classList.add('fullHeight');
        this.container.classList.add('bg');
        mainContent.appendChild(this.container);

        this.dialog = document.createElement('div');
        this.dialog.classList.add('dialog');
        this.dialog.style.width = '400px';
        this.dialog.style.left = (document.body.clientWidth - 400) / 2 + 'px';
        this.container.appendChild(this.dialog);

        let titleArea: HTMLDivElement = document.createElement('div');
        titleArea.classList.add('dialogTitle');
        titleArea.innerHTML = '<span>Reset Password</span>';
        this.dialog.appendChild(titleArea);

        let table: HTMLTableElement = document.createElement('table');
        table.classList.add('fullWidth');
        this.dialog.appendChild(table);

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
        this.userName.classList.add('dialog_width');
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
        this.email.classList.add('dialog_width');
        td.appendChild(this.email);
        row.appendChild(td);

        let buttonArea: HTMLDivElement = document.createElement('div');
        buttonArea.classList.add('buttonArea');
        this.dialog.appendChild(buttonArea);

        let signIn: HTMLAnchorElement = document.createElement('a');
        signIn.classList.add('secondary');
        signIn.innerText = 'Sign In';
        signIn.addEventListener('click', () => {
            RemoteTM.showLogin();
        });
        buttonArea.appendChild(signIn);

        let reset: HTMLButtonElement = document.createElement('button');
        reset.innerText = 'Reset Password';
        reset.addEventListener('click', () => {
            this.resetPassword();
        });
        buttonArea.appendChild(reset);

        setTimeout(() => {
            this.resize();
            window.addEventListener('resize', () => { this.resize() });
        }, 200);
    }

    show(): void {
        this.container.classList.remove('hidden');
        this.container.classList.add('block');
        this.userName.focus();
    }

    close(): void {
        this.container.classList.remove('block');
        this.container.classList.add('hidden');
    }

    resize(): void {
        this.dialog.style.left = (document.body.clientWidth - 400) / 2 + 'px';
    }

    resetPassword(): void {
        if (this.userName.value === '' && this.email.value === '') {
            return;
        }
        if (this.userName.value === '') {
            window.alert('Enter user name');
            return;
        }
        if (this.email.value === '') {
            window.alert('Enter email address');
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
                        window.alert('If entered data matches our records, an email with password change information will be sent.');
                    } else {
                        window.alert(json.reason);
                    }
                } else if (req.status == 401) {
                    window.alert('Access denied');
                } else {
                    window.alert('Server status: ' + req.status
                        + '. Try again later.');
                }
            }
        };
        req.send(JSON.stringify(json));
    }
}