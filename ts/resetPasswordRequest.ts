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

import { Input } from "./input";
import { RemoteTM } from "./remotetm";
import { View } from "./view";

export class ResetPassworRequest implements View {

    container: HTMLDivElement;
    dialog: HTMLDivElement;
    userName: Input;
    email: Input;

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
        this.dialog.style.top = (document.body.clientHeight * 0.2) + 'px';
        this.container.appendChild(this.dialog);

        let titleArea: HTMLDivElement = document.createElement('div');
        titleArea.classList.add('dialogTitle');
        titleArea.innerHTML = '<span>Reset Password</span>';
        this.dialog.appendChild(titleArea);

        let holder: HTMLDivElement = document.createElement('div');
        holder.classList.add('fullWidth');
        holder.style.paddingTop = '20px';
        holder.style.paddingBottom = '20px';
        this.dialog.appendChild(holder);

        this.userName = new Input(holder, 'User Name', 'text');
        this.userName.addEventListener('keydown', (ev: KeyboardEvent) => { this.keyListener(ev); });
        this.email = new Input(holder, 'Email', 'text');
        this.email.addEventListener('keydown', (ev: KeyboardEvent) => { this.keyListener(ev); });

        let buttonArea: HTMLDivElement = document.createElement('div');
        buttonArea.classList.add('buttonArea');
        this.dialog.appendChild(buttonArea);

        let signIn: HTMLAnchorElement = document.createElement('a');
        signIn.classList.add('secondary');
        signIn.innerText = 'Sign In';
        signIn.addEventListener('click', () => {
            this.close();
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
            window.addEventListener('resize', () => { this.resize(); });
        }, 200);
    }

    keyListener(event: KeyboardEvent): void {
        if (event.key === 'Enter' || event.key === 'NumpadEnter') {
            this.resetPassword();
        }
    }

    show(): void {
        this.userName.focus();
    }

    close(): void {
        let mainContent: HTMLDivElement = document.getElementById('mainContent') as HTMLDivElement;
        mainContent.removeChild(this.container);
    }

    resize(): void {
        this.dialog.style.left = (document.body.clientWidth - 400) / 2 + 'px';
    }

    resetPassword(): void {
        if (this.userName.getValue() === '' && this.email.getValue() === '') {
            return;
        }
        if (this.userName.getValue() === '') {
            RemoteTM.showMessage('Enter user name');
            return;
        }
        if (this.email.getValue() === '') {
            RemoteTM.showMessage('Enter email address');
            return;
        }

        let params: any = {
            command: 'request',
            id: this.userName.getValue(),
            email: this.email.getValue()
        };
        fetch(RemoteTM.getMainURL() + '/reset', {
            method: 'POST',
            headers: [
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ],
            body: JSON.stringify(params)
        }).then(async (response: Response) => {
            let json: any = await response.json();
            if (json.status === 'OK') {
                RemoteTM.showMessage('If entered data matches our records, an email with password change information will be sent.');
                this.close();
                RemoteTM.showLogin();
            } else {
                RemoteTM.showMessage(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }
}