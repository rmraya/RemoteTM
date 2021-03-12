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

import { Dashboard } from "./dashboard";
import { Dialog } from "./dialog";
import { LoginForm } from "./loginForm";
import { ResetPasswordForm } from "./resetPasswordForm";
import { View } from "./view";

export class RemoteTM {
    private static waitingCount: number;
    private static session: string = '';
    private static who: string = '';
    private static mainURL: string = '';

    private static openDialogs: Map<string, Dialog>;

    private static currentView: View;
    private static dashboard: Dashboard;
    private static loginForm: LoginForm;
    private static resetForm: ResetPasswordForm;

    constructor() {
        let host: string = location.host;
        let protocol: string = location.protocol;
        let path: string = location.pathname;
        let n = path.lastIndexOf('/');
        if (n !== -1) {
            path = path.substring(0, n);
        }
        RemoteTM.mainURL = protocol + '//' + host + path;

        RemoteTM.waitingCount = 0;

        this.getVersion();

        window.addEventListener('resize', () => {
            this.resize();
        });

        RemoteTM.showLogin();
    }

    resize(): void {
        let footer: HTMLElement = document.getElementById('footer');
        let mainContent: HTMLDivElement = document.getElementById('mainContent') as HTMLDivElement;
        mainContent.style.height = (document.body.clientHeight - footer.clientHeight) + 'px';
        mainContent.style.width = document.body.clientWidth + 'px';
    }

    public static getSession(): string {
        return this.session;
    }

    public static getMainURL(): string {
        return this.mainURL;
    }

    public static getUser(): string {
        return this.who;
    }

    getVersion(): void {
        fetch(RemoteTM.mainURL + '/version', {
            method: 'GET',
            headers: [
                ['Accept', 'application/json']
            ]
        }).then((response: Response) => response.json())
            .then((json: any) => {
                if (json.status === 'OK') {
                    let versionSpan: HTMLSpanElement = document.getElementById('version') as HTMLSpanElement;
                    if (versionSpan) {
                        versionSpan.innerHTML = json.version;
                    }
                } else {
                    window.alert(json.reason);
                }
            }).catch((reason: any) => {
                console.error('Error:', reason);
            });
    }

    public static requestTicket(userName: string, auth: string) {
        fetch(RemoteTM.mainURL + '/remote', {
            method: 'GET',
            headers: [
                ['Authorization', 'BASIC ' + auth],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ]
        }).then(async (response: Response) => {
            let json: any = await response.json();
            if (json.status === 'OK') {
                RemoteTM.session = json.session;
                RemoteTM.who = userName;
                RemoteTM.showDashboard();
            } else {
                window.alert(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    public static showLogin() {
        if (this.currentView) {
            this.currentView.close();
        }
        if (!this.loginForm) {
            this.loginForm = new LoginForm();
        }
        this.loginForm.clearForm();
        this.currentView = this.loginForm;
        this.currentView.show();
    }

    public static resetPassword() {
        if (this.currentView) {
            this.currentView.close();
        }
        if (!this.resetForm) {
            this.resetForm = new ResetPasswordForm();
        }
        this.currentView = this.resetForm;
        this.currentView.show();
    }

    public static showDashboard(): void {
        if (this.currentView) {
            this.currentView.close();
        }
        if (!this.dashboard) {
            this.dashboard = new Dashboard();
        }
        this.currentView = this.dashboard;
        this.currentView.show();
    }

    public static signOut() {
        var req = new XMLHttpRequest();
        req.open('GET', RemoteTM.mainURL + '/logout/clean', true);
        req.setRequestHeader('Accept', 'application/json');
        req.setRequestHeader('user', RemoteTM.who);
        req.setRequestHeader('hostURL', RemoteTM.getMainURL());
        req.setRequestHeader('timeOut', 'false'); // TODO implement automatic timeout

        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var json = JSON.parse(req.responseText);
                    if (json.status === 'OK') {
                        RemoteTM.who = '';
                        RemoteTM.session = '';
                        let logoutUrl = json.logoutUrl;
                        if (!logoutUrl) {
                            this.showLogin();
                            return;
                        }
                        window.location.replace(logoutUrl);
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
        req.send(null);
    }

    public static startWaiting(): void {
        if (RemoteTM.waitingCount === 0) {
            document.body.classList.add("wait");
        }
        RemoteTM.waitingCount++;
    }

    public static endWaiting(): void {
        RemoteTM.waitingCount--;
        if (RemoteTM.waitingCount === 0) {
            document.body.classList.remove("wait");
        }
    }

    static registerDialog(dialog: Dialog): void {
        if (!RemoteTM.openDialogs) {
            RemoteTM.openDialogs = new Map<string, Dialog>();
        }
        RemoteTM.openDialogs.set(dialog.getId(), dialog);
    }

    static removeDialog(dialog: Dialog): void {
        RemoteTM.openDialogs.delete(dialog.getId());
    }
}

new RemoteTM();