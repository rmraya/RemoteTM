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

export class EmailServerDialog {

    dialog: Dialog;

    server: Input;
    port: Input;
    user: Input;
    passwd: Input;
    from: Input;
    instance: Input;
    authentication: CheckBox;
    tls: CheckBox;

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

        this.server = new Input(left, 'SMTP Server', 'text');
        this.port = new Input(left, 'Port', 'number');
        this.user = new Input(left, 'User', 'text');
        this.user = new Input(left, 'Password', 'password');

        this.from = new Input(right, 'Sent From', 'text');
        this.instance = new Input(right, 'RemoteTM Server', 'text');
        this.authentication = new CheckBox(right, 'Authentication Required');
        this.tls = new CheckBox(right, 'Use TLS');

        let button: HTMLButtonElement = document.createElement('button');
        button.innerText = 'Save';
        button.addEventListener('click', () => { this.save(); })
        this.dialog.addButton(button);
    }

    open(): void {
        this.dialog.open();
    }

    save(): void {

    }
}