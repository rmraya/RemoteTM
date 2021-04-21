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

import { CheckBox } from "./checkBox";
import { Dialog } from "./dialog";
import { Message } from "./message";
import { RemoteTM } from "./remotetm";

export class AccessDialog {

    memory: string;
    dialog: Dialog;
    table: HTMLTableElement;
    readMap: Map<string, CheckBox>;
    writeMap: Map<string, CheckBox>;
    exportMap: Map<string, CheckBox>;

    constructor(memory: string) {
        this.memory = memory;

        this.dialog = new Dialog(500);
        this.dialog.setTitle('Set Access');

        let tableContainer: HTMLDivElement = document.createElement('div');
        tableContainer.classList.add('divContainer');
        tableContainer.classList.add('fullWidth');
        tableContainer.style.height = '300px';
        this.dialog.contentArea.appendChild(tableContainer);

        this.table = document.createElement('table');
        tableContainer.appendChild(this.table);

        let setAccess: HTMLButtonElement = document.createElement('button');
        setAccess.innerText = 'Set Access';
        setAccess.addEventListener('click', () => { this.setAccess(); });
        this.dialog.addButton(setAccess);

        this.readMap = new Map();
        this.writeMap = new Map();
        this.exportMap = new Map();

        fetch(RemoteTM.getMainURL() + '/permissions?id=' + encodeURI(memory), {
            method: 'GET',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ]
        }).then(async (response: Response) => {
            let json: any = await response.json();
            json.status === 'OK' ? this.addPermissions(json.permissions) : new Message(json.reason);
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    open(): void {
        this.dialog.open();
    }

    addPermissions(array: any[]): void {
        let length = array.length;
        for (let i = 0; i < length; i++) {
            let permission: any = array[i];
            let tr: HTMLTableRowElement = document.createElement('tr');
            tr.id = permission.user;
            this.table.appendChild(tr);

            let td: HTMLTableCellElement = document.createElement('td');
            td.innerText = permission.user;
            td.classList.add('middle');
            tr.appendChild(td);

            td = document.createElement('td');
            td.classList.add('center');
            let read: CheckBox = new CheckBox(td, 'Read');
            read.setValue(permission.read);
            this.readMap.set(permission.user, read);
            tr.appendChild(td);

            td = document.createElement('td');
            td.classList.add('center');
            let write: CheckBox = new CheckBox(td, 'Write');
            write.setValue(permission.write);
            this.writeMap.set(permission.user, write);
            tr.appendChild(td);

            td = document.createElement('td');
            td.classList.add('center');
            let exp: CheckBox = new CheckBox(td, 'Export');
            exp.setValue(permission.export);
            this.exportMap.set(permission.user, exp);
            tr.appendChild(td);
        }
    }

    setAccess(): void {
        let permissions: any[] = [];
        let rows: HTMLCollectionOf<HTMLTableRowElement> = this.table.getElementsByTagName('tr');
        let length: number = rows.length;
        for (let i = 0; i < length; i++) {
            let row: HTMLTableRowElement = rows[i];
            permissions.push({
                memory: this.memory,
                user: row.id,
                read: this.readMap.get(row.id).getValue(),
                write: this.writeMap.get(row.id).getValue(),
                export: this.exportMap.get(row.id).getValue()
            });
        }
        let params: any = {
            memory: this.memory,
            permissions: permissions
        }
        fetch(RemoteTM.getMainURL() + '/permissions', {
            method: 'POST',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ],
            body: JSON.stringify(params)
        }).then(async (response: Response) => {
            let json: any = await response.json();
            json.status === 'OK' ? this.dialog.close() : new Message(json.reason);
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }
}