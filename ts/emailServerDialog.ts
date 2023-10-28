/*******************************************************************************
 * Copyright (c) 2008-2023 Maxprograms.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 1.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/org/documents/epl-v10.html
 *
 * Contributors:
 *     Maxprograms - initial API and implementation
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

        fetch(RemoteTM.getMainURL() + '/email', {
            method: 'GET',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ]
        }).then(async (response: Response) => {
            let json: any = await response.json();
            json.status === 'OK' ? this.populateFields(json) : RemoteTM.showMessage(json.reason);
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    open(): void {
        this.dialog.open();
    }

    populateFields(json: any): void {
        this.serverInput.setValue(json.server);
        this.portInput.setValue(json.port);
        this.userInput.setValue(json.user);
        this.passwordInput.setValue(json.password);
        this.fromInput.setValue(json.from);
        this.instanceInput.setValue(json.instance ? json.instance : RemoteTM.getMainURL());
        this.authenticationBox.setValue(json.authenticate);
        this.tlsBox.setValue(json.tls);
    }

    save(): void {
        let server: string = this.serverInput.getValue();
        if (!server) {
            RemoteTM.showMessage('Enter SMTP server');
            return;
        }
        let port: string = this.portInput.getValue();
        if (!port) {
            RemoteTM.showMessage('Enter port');
            return;
        }
        let user: string = this.userInput.getValue();
        if (!user) {
            RemoteTM.showMessage('Enter SMTP user');
            return;
        }
        let password: string = this.passwordInput.getValue();
        if (!password) {
            RemoteTM.showMessage('Enter SMTP password');
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
            from: sendFrom,
            instance: instance,
            authenticate: authenticate,
            tls: tls
        }
        fetch(RemoteTM.getMainURL() + '/email', {
            method: 'POST',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ],
            body: JSON.stringify(params)
        }).then(async (response: Response) => {
            let json: any = await response.json();
            json.status === 'OK' ? this.dialog.close() : RemoteTM.showMessage(json.reason);
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }
}