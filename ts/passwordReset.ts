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

export class PasswordReset implements View {

    container: HTMLDivElement;
    dialog: HTMLDivElement;
    userName: Input;
    passwd: Input;
    repeat: Input;
    id: string;
    code: string

    constructor(code: string) {
        this.code = code;

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
        this.passwd = new Input(holder, 'New Password', 'password');
        this.passwd.addEventListener('keydown', (ev: KeyboardEvent) => { this.keyListener(ev); });
        this.repeat = new Input(holder, 'Repeat Password', 'password');
        this.repeat.addEventListener('keydown', (ev: KeyboardEvent) => { this.keyListener(ev); });

        let buttonArea: HTMLDivElement = document.createElement('div');
        buttonArea.classList.add('buttonArea');
        this.dialog.appendChild(buttonArea);

        let signIn: HTMLButtonElement = document.createElement('button');
        signIn.innerText = 'Reset Password';
        signIn.addEventListener('click', () => {
            this.resetPassword();
        });
        buttonArea.appendChild(signIn);

        setTimeout(() => {
            this.resize();
            window.addEventListener('resize', () => { this.resize(); });
        }, 200);

        let params: any = {
            command: 'getId',
            code: code
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
                this.id = json.id;
            } else {
                new Message(json.reason);
                this.close();
                RemoteTM.showLogin();
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    keyListener(event: KeyboardEvent): void {
        if (event.key === 'Enter' || event.key === 'NumpadEnter') {
            this.resetPassword();
        }
    }

    resetPassword(): void {
        let userId: string = this.userName.getValue();
        if (this.id != userId) {
            new Message('Incorrect user name');
            this.close();
            RemoteTM.showLogin();
            return;
        }
        let password: string = this.passwd.getValue();
        if (password === '') {
            new Message('Enter password');
            return;
        }
        let repeat: string = this.repeat.getValue();
        if (repeat === '') {
            new Message('Repeat password');
            return;
        }
        if (password !== repeat) {
            new Message('Different passwords');
            return;
        }
        if (this.isWeak(password)) {
            new Message('Weak passwords');
            return;
        }

        let params: any = {
            command: 'setPassword',
            code: this.code,
            id: this.id,
            password: password
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
                new Message('Password set');
            } else {
                new Message(json.reason);
            }
            this.close();
            RemoteTM.showLogin();
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
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

    isWeak(password: string): boolean {
        let length: number = password.length;
        if (length < 10) {
            return true;
        }
        let hasLower: boolean = false;
        for (let i = 0; i < length; i++) {
            if (this.isLower(password[i])) {
                hasLower = true;
                break;
            }
        }
        if (!hasLower) {
            return true;
        }
        let hasUpper: boolean = false;
        for (let i = 0; i < length; i++) {
            if (this.isUpper(password[i])) {
                hasUpper = true;
                break;
            }
        }
        if (!hasUpper) {
            return true;
        }
        let hasNumber: boolean = false;
        for (let i = 0; i < length; i++) {
            if (this.isNumber(password[i])) {
                hasNumber = true;
                break;
            }
        }
        if (!hasNumber) {
            return true;
        }
        return false;
    }

    isLower(char: string): boolean {
        return (/[a-z]/).test(char)
    }

    isUpper(char: string): boolean {
        return (/[A-Z]/).test(char)
    }

    isNumber(char: string): boolean {
        return (/[0-9]/).test(char)
    }
}