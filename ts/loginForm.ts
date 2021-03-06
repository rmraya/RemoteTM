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

export class LoginForm implements View {

    dialog: Dialog;
    userName: HTMLInputElement;
    passwd: HTMLInputElement;

    constructor() {

        this.dialog = new Dialog(400);
        this.dialog.setTitle('User Authentication');
        this.dialog.canClose(false);

        let table: HTMLTableElement = document.createElement('table');
        table.classList.add('fill_width')
        let row: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(row);

        let td: HTMLTableCellElement = document.createElement('td');
        td.classList.add('middle');
        let userLabel: HTMLLabelElement = document.createElement('label');
        userLabel.innerText = 'User Name';
        userLabel.htmlFor = 'userName';
        td.appendChild(userLabel);
        row.appendChild(td);

        td = document.createElement('td');
        td.classList.add('fill_width');
        td.classList.add('middle');
        this.userName = document.createElement('input');
        this.userName.type = 'text';
        this.userName.classList.add('fill_width');
        this.userName.id = 'userName';
        td.appendChild(this.userName);
        row.appendChild(td);

        row = document.createElement('tr');
        table.appendChild(row);

        td = document.createElement('td');
        td.classList.add('middle');
        let passwdLabel: HTMLLabelElement = document.createElement('label');
        passwdLabel.innerText = 'Password';
        passwdLabel.htmlFor = 'password';
        td.appendChild(passwdLabel);
        row.appendChild(td);

        td = document.createElement('td');
        td.classList.add('fill_width');
        td.classList.add('middle');
        this.passwd = document.createElement('input');
        this.passwd.type = 'password';
        this.passwd.id = 'password';
        this.passwd.classList.add('fill_width');
        td.appendChild(this.passwd);
        row.appendChild(td);

        this.dialog.addChild(table);

        let signIn: HTMLButtonElement = document.createElement('button');
        signIn.innerText = 'Sign In';
        signIn.addEventListener('click', () => {
            this.signIn()
        });
        this.dialog.addButton(signIn);

        let reset: HTMLButtonElement = document.createElement('button');
        reset.innerText = 'Reset Password';
        reset.addEventListener('click', () => {
            RemoteTM.resetPassword();
        });
        this.dialog.addButton(reset);
    }

    show(): void {
        this.dialog.open();
    }

    close(): void {
        this.dialog.close();
    }

    signIn(): void {
        if (this.userName.value === '' && this.passwd.value === '') {
            return;
        }
        if (this.userName.value === '') {
            RemoteTM.alert('Enter user name');
            return;
        }
        if (this.passwd.value === '') {
            RemoteTM.alert('Enter password');
            return;
        }
        var auth = btoa(this.userName.value + ':' + this.passwd.value);
        RemoteTM.requestTicket(this.userName.value, auth);
    }
}