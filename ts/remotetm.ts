/*******************************************************************************
Copyright (c) 2008-2020 - Maxprograms,  http://www.maxprograms.com/

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
import { LoginForm } from "./loginForm";
import { ResetPassword } from "./resetPasswordForm";
import { Dialog } from "./dialog";

export class RemoteTM {
    private static waitingCount: number;
    private static session: string = '';
    private static who: string = '';
    private static mainURL: string = '';
    private sso: boolean;

    constructor() {
        var host: string = location.host;
        var protocol: string = location.protocol;
        var path: string = location.pathname;

        var n = path.lastIndexOf('/');
        if (n !== -1) {
            path = path.substring(0, n);
        }
        RemoteTM.mainURL = protocol + '//' + host + path;

        RemoteTM.waitingCount = 0;

        this.getVersion();

        let mainContent: HTMLDivElement = document.getElementById('mainContent') as HTMLDivElement;

        const config: MutationObserverInit = { attributes: false, childList: true, subtree: false };
        const callback = function (mutationsList: MutationRecord[], observer: MutationObserver): void {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    let added: NodeList = mutation.addedNodes;
                    if (added.length > 0) {
                        let main: HTMLDivElement = document.getElementById('mainContent') as HTMLDivElement;
                        main.style.height = (document.body.clientHeight - 75) + 'px';
                        main.style.width = document.body.clientWidth + 'px';
                    }
                }
            }
        };
        let observer: MutationObserver = new MutationObserver(callback);
        observer.observe(mainContent, config);

        window.addEventListener('resize', () => {
            mainContent.style.height = (document.body.clientHeight - 75) + 'px';
            mainContent.style.width = document.body.clientWidth + 'px';
        });

        let id = document.getElementById('appHead').getAttribute("data-id");
        let session = document.getElementById('appHead').getAttribute("data-session");
        if (id !== null && session !== null) {
            this.sso = true;
            RemoteTM.session = session;
            RemoteTM.who = id;
            new Dashboard();
            return;
        }
        this.sso = false;
        new LoginForm();
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
        var req = new XMLHttpRequest();
        req.open('GET', RemoteTM.mainURL + '/version', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('Accept', 'application/json');
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var json = JSON.parse(req.responseText);
                    if (json.status === 'OK') {
                        document.getElementById('version').innerHTML = json.version;
                    } else {
                        RemoteTM.alert(json.reason);
                    }
                } else {
                    RemoteTM.alert('Server status: ' + req.status
                        + '. Try again later.');
                }
            }
        };
        req.send(null);
    }

    public static requestTicket(userName: string, auth: string) {
        var req = new XMLHttpRequest();
        req.open('GET', RemoteTM.mainURL + '/remote', true);
        req.setRequestHeader('Authorization', 'BASIC ' + auth);
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('Accept', 'application/json');
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var json = JSON.parse(req.responseText);
                    if (json.status === 'OK') {
                        RemoteTM.session = json.session;
                        RemoteTM.who = userName;
                        new Dashboard();
                    } else {
                        RemoteTM.alert(json.reason);
                    }
                } else if (req.status == 401) {
                    RemoteTM.alert('Access denied');
                } else {
                    RemoteTM.alert('Server status: ' + req.status
                        + '. Try again later.');
                }
            }
        };
        req.send(null);
    }

    public static resetPassword() {
        new ResetPassword();
    }

    public static signOut() {
        var req = new XMLHttpRequest();
        req.open('GET', RemoteTM.mainURL + '/logout/clean', true);
        req.setRequestHeader('Accept', 'application/json');
        req.setRequestHeader('user', RemoteTM.who);
        req.setRequestHeader('hostURL', RemoteTM.getMainURL());
        req.setRequestHeader('timeOut', 'false'); // TODO implement automatic timeout

        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var json = JSON.parse(req.responseText);
                    if (json.status === 'OK') {
                        RemoteTM.who = '';
                        RemoteTM.session = '';
                        let logoutUrl = json.logoutUrl;
                        if (logoutUrl === '') {
                            new LoginForm();
                            return;
                        }
                        window.location.replace(logoutUrl);
                    } else {
                        RemoteTM.alert(json.reason);
                    }
                } else if (req.status == 401) {
                    RemoteTM.alert('Access denied');
                } else {
                    RemoteTM.alert('Server status: ' + req.status
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

    public static alert(message: string): void {
        let dialog: Dialog = new Dialog(300);

        dialog.setTitle('Attention');

        let div: HTMLDivElement = document.createElement('div');
        div.innerText = message;
        div.classList.add('center');
        dialog.addChild(div);

        let button: HTMLButtonElement = document.createElement('button');
        button.innerText = 'Close';
        button.addEventListener('click', () => {
            dialog.close();
        });
        dialog.addButton(button);

        let screenHeight = document.body.clientHeight;
        let top = (screenHeight - 130) / 2;
        dialog.setTop(top);
        dialog.open();
    }

}

new RemoteTM();