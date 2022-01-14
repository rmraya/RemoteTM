/*******************************************************************************
 * Copyright (c) 2008-2022 Maxprograms.
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
import { Input } from "./input";
import { Message } from "./message";
import { RemoteTM } from "./remotetm";

export class AddMemory {

    parent: Dashboard;
    dialog: Dialog;
    nameInput: Input;
    projectInput: Input;
    subjectInput: Input;
    clientInput: Input;

    constructor(parent: Dashboard) {
        this.parent = parent;

        this.dialog = new Dialog(350);
        this.dialog.setTitle('Add Memory');

        this.nameInput = new Input(this.dialog.contentArea, 'Memory Name', 'text');
        this.projectInput = new Input(this.dialog.contentArea, 'Project', 'text');
        this.subjectInput = new Input(this.dialog.contentArea, 'Subject', 'text');
        this.clientInput = new Input(this.dialog.contentArea, 'Client', 'text');

        let button: HTMLButtonElement = document.createElement('button');
        button.innerText = 'Add Memory';
        button.addEventListener('click', () => { this.addMemory(); });
        this.dialog.addButton(button);
    }

    open(): void {
        this.dialog.open();
    }

    addMemory(): void {
        let name: string = this.nameInput.getValue();
        if (!name) {
            new Message('Enter name');
            return;
        }
        let project: string = this.projectInput.getValue();
        let subject: string = this.subjectInput.getValue();
        let client: string = this.clientInput.getValue();
        let params: any = {
            name: name,
            owner: RemoteTM.getUser(),
            project: project,
            subject: subject,
            client: client,
            command: 'addMemory'
        };
        this.parent.setStatus('Adding memory...');
        fetch(RemoteTM.getMainURL() + '/memories', {
            method: 'POST',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ],
            body: JSON.stringify(params)
        }).then(async (response: Response) => {
            let json: any = await response.json();
            this.parent.setStatus('');
            if (json.status === 'OK') {
                this.dialog.close();
                this.parent.loadMemories();
            } else {
                new Message(json.reason);
            }
        }).catch((reason: any) => {
            this.parent.setStatus('');
            console.error('Error:', reason);
        });
    }
}