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
            if (json.status === 'OK') {
                this.dialog.close();
                this.parent.loadMemories();
            } else {
                new Message(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }
}