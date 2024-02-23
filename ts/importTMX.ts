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
import { DropZone } from "./dropZone";
import { Input } from "./input";
import { RemoteTM } from "./remotetm";

export class ImportTMX {

    parent: Dashboard;
    memory: string;
    dialog: Dialog;
    dropZone: DropZone
    project: Input;
    subject: Input;
    client: Input;

    constructor(parent: Dashboard, memory: string) {
        this.parent = parent;
        this.memory = memory;

        this.dialog = new Dialog(400);
        this.dialog.setTitle('Import TMX');

        this.dropZone = new DropZone(this.dialog.contentArea);
        this.project = new Input(this.dialog.contentArea, 'Project', 'text');
        this.subject = new Input(this.dialog.contentArea, 'Subject', 'text');
        this.client = new Input(this.dialog.contentArea, 'Client', 'text');

        this.getProjects();
        this.getSubjects();
        this.getClients();

        let importButton: HTMLButtonElement = document.createElement('button');
        importButton.innerText = 'Import TMX';
        importButton.addEventListener('click', () => { this.importTMX(); });
        this.dialog.addButton(importButton);
    }

    open(): void {
        this.dialog.open();
    }

    importTMX(): void {
        let files: FileList = this.dropZone.getFiles();
        if (files.length === 0) {
            RemoteTM.showMessage('Select file');
            return;
        }
        let params: any = {
            command: 'openMemory',
            memory: this.memory
        }
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
            json.status === 'OK' ? this.uploadFile(files[0]) : RemoteTM.showMessage(json.reason);
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    uploadFile(file: File): void {
        let formData = new FormData();
        formData.append("file", file);
        this.parent.setStatus('Uploading...');
        fetch(RemoteTM.getMainURL() + '/upload', {
            method: 'POST',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'multipart/form-data'],
                ['Accept', 'application/json']
            ],
            body: formData
        }).then(async (response: Response) => {
            let json: any = await response.json();
            this.parent.setStatus('');
            json.status === 'OK' ? this.requestImport(json.file) : RemoteTM.showMessage(json.reason);
        }).catch((reason: any) => {
            this.parent.setStatus('');
            console.error('Error:', reason);
        });
    }

    requestImport(file: string) {
        let params: any = {
            command: 'importTMX',
            memory: this.memory,
            project: this.project.getValue(),
            subject: this.subject.getValue(),
            client: this.client.getValue(),
            file: file,
            close: true
        };
        this.parent.setStatus('Starting import...');
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
                RemoteTM.showMessage('You will receive an email with import results');
                this.dialog.close();
            } else {
                RemoteTM.showMessage(json.reason);
            }
        }).catch((reason: any) => {
            this.parent.setStatus('');
            console.error('Error:', reason);
        });
    }

    getProjects(): void {
        let params: any = {
            command: 'getProjects'
        }
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
                this.project.setList(json.projects);
            } else {
                RemoteTM.showMessage(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    getSubjects(): void {
        let params: any = {
            command: 'getSubjects'
        }
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
                this.subject.setList(json.subjects);
            } else {
                RemoteTM.showMessage(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    getClients(): void {
        let params: any = {
            command: 'getClients'
        }
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
                this.client.setList(json.clients);
            } else {
                RemoteTM.showMessage(json.reason);
            }
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }
}