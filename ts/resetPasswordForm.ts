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

import { Input } from "./input";
import { Message } from "./message";
import { RemoteTM } from "./remotetm";
import { View } from "./view";

export class ResetPasswordForm implements View {

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
        if (this.userName.getValue() === '' && this.email.getValue() === '') {
            return;
        }
        if (this.userName.getValue() === '') {
            new Message('Enter user name');
            return;
        }
        if (this.email.getValue() === '') {
            new Message('Enter email address');
            return;
        }
        let params: any = {
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
                new Message('If entered data matches our records, an email with password change information will be sent.');
                RemoteTM.showLogin();
            } else {
                new Message(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }
}