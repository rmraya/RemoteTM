/*******************************************************************************
 * Copyright (c) 2008-2024 Maxprograms.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 1.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/org/documents/epl-v10.html
 *
 * Contributors:
 *     Maxprograms - initial API and implementation
 *******************************************************************************/

import { Dashboard } from "./dashboard";
import { Dialog } from "./dialog";
import { LoginForm } from "./loginForm";
import { PasswordReset } from "./passwordReset";
import { ResetPassworRequest } from "./resetPasswordRequest";
import { Role } from "./roles";

export class RemoteTM {

    public static VERSION: string = '5.0.0';
    public static BUILD: string = '';
    public static UPDATES: any = {};

    private static waitingCount: number;
    private static session: string = '';
    private static who: string = '';
    private static mainURL: string = '';

    private static openDialogs: Map<string, Dialog>;

    constructor() {
        let host: string = location.host;
        let protocol: string = location.protocol;
        let path: string = location.pathname;
        let search: string = location.search;
        let code: string = '';
        if (search) {
            let params = new URLSearchParams(search);
            code = params.get('key');
        }
        let n = path.lastIndexOf('/');
        if (n !== -1) {
            path = path.substring(0, n);
        }
        RemoteTM.mainURL = protocol + '//' + host + path;

        RemoteTM.waitingCount = 0;
        RemoteTM.openDialogs = new Map<string, Dialog>();
        this.getVersion();

        window.addEventListener('resize', () => {
            this.resize();
        });

        document.documentElement.addEventListener("dragover", (event: DragEvent) => {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = "move";
            }
        });

        document.documentElement.addEventListener("drop", (event: DragEvent) => {
            event.preventDefault();
            if (event.dataTransfer) {
                let id: string = event.dataTransfer.getData("id");
                if (id) {
                    let element: HTMLElement | null = document.getElementById(id);
                    if (element && element.classList.contains('dialog')) {
                        const offset: any = JSON.parse(event.dataTransfer.getData("offset"));
                        const xPos: number = event.clientX - parseInt(offset.x);
                        const yPos: number = event.clientY - parseInt(offset.y);
                        element.style.left = xPos + 'px';
                        element.style.top = yPos + 'px';
                    }
                }
            }
        });

        if (code) {
            this.showReset(code);
            return;
        }
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
        }).then(async (response: Response) => {
            let json: any = await response.json();
            if (json.status === 'OK') {
                let versionSpan: HTMLSpanElement = document.getElementById('version') as HTMLSpanElement;
                if (versionSpan) {
                    versionSpan.innerHTML = json.version + '_' + json.build;
                }
                RemoteTM.VERSION = json.version;
                RemoteTM.BUILD = json.build;
                RemoteTM.UPDATES = json.updates;
            } else {
                RemoteTM.showMessage(json.reason);
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
                RemoteTM.session = json.ticket;
                RemoteTM.who = userName;
                RemoteTM.showDashboard(json.role);
                if (json.role === Role.SYSTEM_ADMINISTRATOR) {
                    if (RemoteTM.VERSION !== RemoteTM.UPDATES.version || RemoteTM.BUILD !== RemoteTM.UPDATES.build) {
                        RemoteTM.showMessage('RemoteTM version ' + RemoteTM.UPDATES.version + '_' + RemoteTM.UPDATES.build + ' is available');
                    }
                }
            } else {
                RemoteTM.showMessage(json.reason);
                RemoteTM.showLogin();
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    public static showLogin(): void {
        RemoteTM.who = '';
        RemoteTM.session = '';
        let view = new LoginForm();
        view.show();
    }

    showReset(code: string): void {
        let view = new PasswordReset(code);
        view.show();
    }

    public static resetPassword(): void {
        let view = new ResetPassworRequest();
        view.show();
    }

    public static showDashboard(role: string): void {
        let view = new Dashboard(role);
        view.show();
    }

    public static signOut() {
        RemoteTM.openDialogs.forEach((dialog) => {
            dialog.close();
        });
        fetch(RemoteTM.mainURL + '/logout', {
            method: 'GET',
            headers: [
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json'],
                ['Session', RemoteTM.session]
            ]
        }).then(async (response: Response) => {
            let json: any = await response.json();
            if (json.status !== 'OK') {
                RemoteTM.showMessage(json.reason);
            }
            RemoteTM.showLogin();
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
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

    static dialogCount(): number {
        if (!RemoteTM.openDialogs) {
            RemoteTM.openDialogs = new Map<string, Dialog>();
        }
        return RemoteTM.openDialogs.size;
    }

    static htmlToElement(html: string) {
        let template = document.createElement('template');
        html = html.trim();
        template.innerHTML = html;
        return template.content.firstChild;
    }

    static showMessage(message: string): void {
        let container: HTMLDivElement = document.createElement('div');
        container.classList.add('message');
        container.innerText = message;
        document.body.appendChild(container);
        setTimeout(() => {
            document.body.removeChild(container);
        }, 3000);
    }
}

try {
    new RemoteTM();
} catch (e) {
    console.error(e);
}