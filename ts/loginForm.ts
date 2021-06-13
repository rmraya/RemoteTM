/*******************************************************************************
 * Copyright (c) 2008-2021 Maxprograms.
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
import { Message } from "./message";
import { RemoteTM } from "./remotetm";
import { View } from "./view";

export class LoginForm implements View {

    container: HTMLDivElement;
    dialog: HTMLDivElement;
    userName: Input;
    passwd: Input;

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
        titleArea.innerHTML = '<span>Sign In</span>';
        this.dialog.appendChild(titleArea);

        let holder: HTMLDivElement = document.createElement('div');
        holder.classList.add('fullWidth');
        holder.style.paddingTop = '20px';
        holder.style.paddingBottom = '20px';
        this.dialog.appendChild(holder);

        this.userName = new Input(holder, 'User Name', 'text');
        this.userName.addEventListener('keydown', (ev: KeyboardEvent) => { this.keyListener(ev); });
        this.passwd = new Input(holder, 'Password', 'password');
        this.passwd.addEventListener('keydown', (ev: KeyboardEvent) => { this.keyListener(ev); });

        let buttonArea: HTMLDivElement = document.createElement('div');
        buttonArea.classList.add('buttonArea');
        this.dialog.appendChild(buttonArea);

        let reset: HTMLAnchorElement = document.createElement('a');
        reset.classList.add('secondary');
        reset.innerText = 'Reset Password';
        reset.addEventListener('click', () => {
            this.close();
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
        this.userName.focus();
    }

    close(): void {
        let mainContent: HTMLDivElement = document.getElementById('mainContent') as HTMLDivElement;
        mainContent.removeChild(this.container);
    }

    resize(): void {
        this.dialog.style.left = (document.body.clientWidth - 400) / 2 + 'px';
    }

    signIn(): void {
        if (this.userName.getValue() === '' && this.passwd.getValue() === '') {
            return;
        }
        if (this.userName.getValue() === '') {
            new Message('Enter user name');
            return;
        }
        if (this.passwd.getValue() === '') {
            new Message('Enter password');
            return;
        }
        let auth = btoa(this.userName.getValue() + ':' + this.passwd.getValue());
        this.close();
        RemoteTM.requestTicket(this.userName.getValue(), auth);
    }
}