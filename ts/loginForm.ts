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

export class LoginForm implements View {

    container: HTMLDivElement;
    dialog: HTMLDivElement;
    userName: HTMLInputElement;
    passwd: HTMLInputElement;

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
        titleArea.innerHTML = '<span>Sign In</span>';
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
        this.userName.addEventListener('keydown', (ev: KeyboardEvent) => { this.keyListener(ev); })
        td.appendChild(this.userName);
        row.appendChild(td);

        row = document.createElement('tr');
        table.appendChild(row);

        td = document.createElement('td');
        td.classList.add('middle');
        let passwdLabel: HTMLLabelElement = document.createElement('label');
        passwdLabel.innerText = 'Password';
        td.appendChild(passwdLabel);
        row.appendChild(td);

        td = document.createElement('td');
        td.classList.add('fullWidth');
        td.classList.add('middle');
        this.passwd = document.createElement('input');
        this.passwd.type = 'password';
        this.passwd.classList.add('dialog_width');
        this.passwd.addEventListener('keydown', (ev: KeyboardEvent) => { this.keyListener(ev); })
        td.appendChild(this.passwd);
        row.appendChild(td);

        let buttonArea: HTMLDivElement = document.createElement('div');
        buttonArea.classList.add('buttonArea');
        this.dialog.appendChild(buttonArea);

        let reset: HTMLAnchorElement = document.createElement('a');
        reset.classList.add('secondary');
        reset.innerText = 'Reset Password';
        reset.addEventListener('click', () => {
            RemoteTM.resetPassword();
        });
        buttonArea.appendChild(reset);

        let signIn: HTMLButtonElement = document.createElement('button');
        signIn.innerText = 'Sign In';
        signIn.addEventListener('click', () => {
            this.signIn();
        });
        buttonArea.appendChild(signIn);

        setTimeout(() => {
            this.resize();
            window.addEventListener('resize', () => { this.resize(); });
        }, 200);
    }

    keyListener(event: KeyboardEvent): void {
        if (event.key === 'Enter' || event.key === 'NumpadEnter') {
            this.signIn();
        }
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

    signIn(): void {
        if (this.userName.value === '' && this.passwd.value === '') {
            return;
        }
        if (this.userName.value === '') {
            window.alert('Enter user name');
            return;
        }
        if (this.passwd.value === '') {
            window.alert('Enter password');
            return;
        }
        var auth = btoa(this.userName.value + ':' + this.passwd.value);
        RemoteTM.requestTicket(this.userName.value, auth);
    }

    clearForm(): void {
        this.userName.value = '';
        this.passwd.value = '';
    }
}