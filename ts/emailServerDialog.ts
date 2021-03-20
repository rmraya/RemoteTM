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

import { CheckBox } from "./checkBox";
import { Dialog } from "./dialog";
import { Input } from "./input";
import { RemoteTM } from "./remotetm";

export class EmailServerDialog {

    dialog: Dialog;

    serverInput: Input;
    portInput: Input;
    userInput: Input;
    passwordInput: Input;
    fromInput: Input;
    instanceInput: Input;
    authenticationBox: CheckBox;
    tlsBox: CheckBox;

    constructor() {
        this.dialog = new Dialog(700);
        this.dialog.setTitle('Email Server');

        let container: HTMLDivElement = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        this.dialog.appendChild(container);

        let left: HTMLDivElement = document.createElement('div');
        left.style.width = '50%';
        container.appendChild(left);

        let right: HTMLDivElement = document.createElement('div');
        right.style.width = '50%';
        container.appendChild(right);

        this.serverInput = new Input(left, 'SMTP Server', 'text');
        this.portInput = new Input(left, 'Port', 'number');
        this.userInput = new Input(left, 'SMTP User', 'text');
        this.passwordInput = new Input(left, 'SMTP Password', 'password');

        this.fromInput = new Input(right, 'Send From', 'text');
        this.instanceInput = new Input(right, 'RemoteTM Server', 'text');
        this.authenticationBox = new CheckBox(right, 'Authentication Required');
        this.tlsBox = new CheckBox(right, 'Use TLS');

        let button: HTMLButtonElement = document.createElement('button');
        button.innerText = 'Save';
        button.addEventListener('click', () => { this.save(); })
        this.dialog.addButton(button);
    }

    open(): void {
        this.dialog.open();
    }

    save(): void {
        let server: string = this.serverInput.getValue();
        if (!server) {
            window.alert('Enter SMTP server');
            return;
        }
        let port: string = this.portInput.getValue();
        if (!port) {
            window.alert('Enter port');
            return;
        }
        let user: string = this.userInput.getValue();
        if (!user) {
            window.alert('Enter SMTP user');
            return;
        }
        let password: string = this.passwordInput.getValue();
        if (!password) {
            window.alert('Enter SMTP password');
            return;
        }
        let sendFrom: string = this.fromInput.getValue();
        if (!sendFrom) {
            sendFrom = user;
        }
        let instance: string = this.instanceInput.getValue();
        if (!instance) {
            instance = RemoteTM.getMainURL();
        }
        let authenticate: boolean = this.authenticationBox.getValue();
        let tls: boolean = this.tlsBox.getValue();
        let params: any = {
            server: server,
            port: port,
            user: user,
            password: password,
            sendFrom: sendFrom,
            instance: instance,
            authenticate: authenticate,
            tls: tls
        }
    }
}