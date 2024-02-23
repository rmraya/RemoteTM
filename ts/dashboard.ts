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

import { AboutDialog } from './about';
import { AccessDialog } from './accessDialog';
import { AddMemory } from './addMemory';
import { ChangePasswordDialog } from './changePassword';
import { DropDown } from './dropdown';
import { EmailServerDialog } from './emailServerDialog';
import { ImportTMX } from './importTMX';
import { LicensesDialog } from './licenses';
import { RemoteTM } from './remotetm';
import { Role } from './roles';
import { UpdatesDialog } from './updatesDialog';
import { UsersManager } from './usersManager';
import { View } from './view';

class Database {
    id: string;
    name: string;
    owner: string;
    project: string;
    subject: string;
    client: string;
    creationDate: string;
    open: boolean;
}

export class Dashboard implements View {

    container: HTMLDivElement;
    role: string;
    tbody: HTMLTableSectionElement;
    selected: string;

    constructor(role: string) {
        this.role = role;
        this.selected = '';
        let mainContent: HTMLDivElement = document.getElementById('mainContent') as HTMLDivElement;

        this.container = document.createElement('div');
        this.container.classList.add('fullWidth');
        this.container.classList.add('fullHeight');
        this.container.style.background = 'var(--gray10)';
        mainContent.appendChild(this.container);

        let topbar: HTMLDivElement = document.createElement('div');
        topbar.classList.add('topbar');
        this.container.appendChild(topbar);

        let title: HTMLSpanElement = document.createElement('span');
        title.classList.add('fullWidth');
        title.classList.add("larger");
        title.innerText = 'RemoteTM';
        topbar.appendChild(title);

        let settingsMenu: DropDown = new DropDown(topbar);
        settingsMenu.setHeaderText('Settings');
        this.createSettingsMenu(settingsMenu);

        let helpMenu: DropDown = new DropDown(topbar);
        helpMenu.setHeaderText('Help');
        this.createHelpMenu(helpMenu);

        let signOut: HTMLAnchorElement = document.createElement('a');
        signOut.innerText = 'Sign Out';
        signOut.addEventListener('click', () => { this.signOut(); });
        topbar.appendChild(signOut);

        let toolbar: HTMLDivElement = document.createElement('div');
        toolbar.classList.add('toolbar');
        this.container.appendChild(toolbar);

        let addMemory: HTMLButtonElement = document.createElement('button');
        addMemory.innerText = 'Add Memory';
        addMemory.addEventListener('click', () => { this.addMemory(); });
        toolbar.appendChild(addMemory);

        let removeMemory: HTMLButtonElement = document.createElement('button');
        removeMemory.innerText = 'Remove Memory';
        removeMemory.addEventListener('click', () => { this.removeMemory(); });
        toolbar.appendChild(removeMemory);

        let setAccess: HTMLButtonElement = document.createElement('button');
        setAccess.innerText = 'Set Access';
        setAccess.addEventListener('click', () => { this.setAccess(); });
        toolbar.appendChild(setAccess);

        let importMemory: HTMLButtonElement = document.createElement('button');
        importMemory.innerText = 'Import TMX';
        importMemory.addEventListener('click', () => { this.importTMX(); });
        toolbar.appendChild(importMemory);

        let exportMemory: HTMLButtonElement = document.createElement('button');
        exportMemory.innerText = 'Export TMX';
        exportMemory.addEventListener('click', () => { this.exportTMX(); });
        toolbar.appendChild(exportMemory);

        let closeMemories: HTMLButtonElement = document.createElement('button');
        closeMemories.innerText = 'Close Memories';
        closeMemories.addEventListener('click', () => { this.closeMemories(); });
        toolbar.appendChild(closeMemories);

        let refreshList: HTMLButtonElement = document.createElement('button');
        refreshList.innerText = 'Refresh';
        refreshList.addEventListener('click', () => { this.loadMemories(); });
        toolbar.appendChild(refreshList);

        let tableContainer: HTMLDivElement = document.createElement('div');
        tableContainer.classList.add('fullWidth');
        tableContainer.classList.add('fullHeight');
        tableContainer.classList.add('divContainer');
        this.container.appendChild(tableContainer);

        let mainTable: HTMLTableElement = document.createElement('table');
        mainTable.classList.add('fullWidth');
        tableContainer.appendChild(mainTable);

        let tableHeader: HTMLTableSectionElement = document.createElement('thead');
        mainTable.appendChild(tableHeader);

        let headerRow: HTMLTableRowElement = document.createElement('tr');
        tableHeader.appendChild(headerRow);

        let selectAllTh: HTMLTableCellElement = document.createElement('th');
        selectAllTh.style.width = '20px';
        selectAllTh.innerHTML = '&nbsp;';
        headerRow.appendChild(selectAllTh);

        let memoryTh: HTMLTableCellElement = document.createElement('th');
        memoryTh.innerText = 'Memory';
        memoryTh.classList.add('left');
        headerRow.appendChild(memoryTh);

        let ownerTh: HTMLTableCellElement = document.createElement('th');
        ownerTh.innerText = 'Owner';
        ownerTh.classList.add('left');
        headerRow.appendChild(ownerTh);

        let creationTh: HTMLTableCellElement = document.createElement('th');
        creationTh.innerText = 'Creation Date';
        creationTh.classList.add('noWrap');
        headerRow.appendChild(creationTh);

        let openTh: HTMLTableCellElement = document.createElement('th');
        openTh.innerText = 'Open';
        headerRow.appendChild(openTh);

        let projectTh: HTMLTableCellElement = document.createElement('th');
        projectTh.innerText = 'Project';
        projectTh.classList.add('left');
        projectTh.classList.add('noWrap');
        headerRow.appendChild(projectTh);

        let subjectTh: HTMLTableCellElement = document.createElement('th');
        subjectTh.innerText = 'Subject';
        subjectTh.classList.add('left');
        subjectTh.classList.add('noWrap');
        headerRow.appendChild(subjectTh);

        let ClientTh: HTMLTableCellElement = document.createElement('th');
        ClientTh.innerText = 'Client';
        ClientTh.classList.add('left');
        ClientTh.classList.add('noWrap');
        headerRow.appendChild(ClientTh);

        this.tbody = document.createElement('tbody');
        this.tbody.classList.add('discover');
        mainTable.appendChild(this.tbody);

        this.loadMemories();

        const config: MutationObserverInit = { attributes: false, childList: true, subtree: false };
        const callback = (mutationsList: MutationRecord[], observer: MutationObserver): void => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    let added: NodeList = mutation.addedNodes;
                    if (added.length > 0) {
                        this.resize();
                    }
                }
            }
        };
        new MutationObserver(callback).observe(mainContent, config);
    }

    show(): void {
        // do nothing
    }

    close(): void {
        let mainContent: HTMLDivElement = document.getElementById('mainContent') as HTMLDivElement;
        mainContent.removeChild(this.container);
    }

    signOut(): void {
        this.close()
        RemoteTM.signOut();
    }

    resize(): void {
        // do nothing
    }

    createSettingsMenu(settingsMenu: DropDown): void {
        let changePassword: HTMLAnchorElement = document.createElement('a');
        changePassword.innerText = 'Change Password';
        changePassword.addEventListener('click', () => { this.changePassword(); });
        settingsMenu.addOption(changePassword);

        if (this.role === Role.SYSTEM_ADMINISTRATOR) {
            settingsMenu.addOption(document.createElement('hr'));

            let manageUsers: HTMLAnchorElement = document.createElement('a');
            manageUsers.innerText = 'Manage Users';
            manageUsers.addEventListener('click', () => { this.manageUsers(); })
            settingsMenu.addOption(manageUsers);

            let emailServer: HTMLAnchorElement = document.createElement('a');
            emailServer.innerText = 'Email Server';
            emailServer.addEventListener('click', () => { this.setEmailServer(); });
            settingsMenu.addOption(emailServer);
        }
    }

    createHelpMenu(helpMenu: DropDown): void {
        let help: HTMLAnchorElement = document.createElement('a');
        help.innerText = 'RemoteTM User Guide';
        help.href = RemoteTM.getMainURL() + '/docs/remotetm.pdf';
        help.target = '_blank';
        helpMenu.addOption(help);

        let supportGroup: HTMLAnchorElement = document.createElement('a');
        supportGroup.innerText = 'Support Group';
        supportGroup.href = 'https://groups.io/g/maxprograms/';
        supportGroup.target = '_blank';
        helpMenu.addOption(supportGroup);

        let licenses: HTMLAnchorElement = document.createElement('a');
        licenses.innerText = 'View Licenses';
        licenses.addEventListener('click', () => { this.viewLicenses(); });
        helpMenu.addOption(licenses);

        if (this.role === Role.SYSTEM_ADMINISTRATOR) {
            let checkUpdates: HTMLAnchorElement = document.createElement('a');
            checkUpdates.innerText = 'Check for Updates...';
            checkUpdates.addEventListener('click', () => { this.checkUpdates(); });
            helpMenu.addOption(checkUpdates);
        }

        helpMenu.addOption(document.createElement('hr'));

        let about: HTMLAnchorElement = document.createElement('a');
        about.innerText = 'About...';
        about.addEventListener('click', () => { this.showAbout(); });
        helpMenu.addOption(about);
    }

    checkUpdates(): void {
        let dialog: UpdatesDialog = new UpdatesDialog();
        dialog.open();
    }

    setEmailServer(): void {
        let dialog: EmailServerDialog = new EmailServerDialog();
        dialog.open();
    }

    manageUsers(): void {
        let dialog: UsersManager = new UsersManager(this);
        dialog.open();
    }

    changePassword(): void {
        let dialog: ChangePasswordDialog = new ChangePasswordDialog(this);
        dialog.open();
    }

    setAccess(): void {
        if (this.selected === '') {
            RemoteTM.showMessage('Select memory');
            return;
        }
        let dialog: AccessDialog = new AccessDialog(this.selected);
        dialog.open();
    }

    showAbout(): void {
        let dialog: AboutDialog = new AboutDialog();
        dialog.open();
    }

    viewLicenses(): void {
        let licenses = new LicensesDialog();
        licenses.open();
    }

    loadMemories(): void {
        fetch(RemoteTM.getMainURL() + '/memories', {
            method: 'GET',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ]
        }).then(async (response: Response) => {
            let json: any = await response.json();
            json.status === 'OK' ? this.displayMemories(json.memories) : RemoteTM.showMessage(json.reason);
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    displayMemories(memories: Database[]): void {
        this.tbody.innerHTML = '';
        let length = memories.length;
        for (let i = 0; i < length; i++) {
            let memory: Database = memories[i];
            let tr: HTMLTableRowElement = document.createElement('tr');
            tr.id = memory.id;
            tr.addEventListener('click', () => {
                this.setSelected(memory.id)
            });
            let td: HTMLTableCellElement = document.createElement('td');
            td.style.width = '20px';
            let check: HTMLInputElement = document.createElement('input');
            check.addEventListener('click', (event: Event) => {
                event.stopPropagation();
                this.setSelected(memory.id);
            });
            check.type = 'checkbox';
            check.id = 'check_' + memory.id;
            check.style.marginTop = '0';
            td.appendChild(check);
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerText = memory.name;
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerText = memory.owner;
            tr.appendChild(td);
            td = document.createElement('td');
            td.classList.add('center');
            td.innerText = memory.creationDate;
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerText = memory.open ? 'Yes' : 'No';
            td.classList.add('center');
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerText = memory.project;
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerText = memory.subject;
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerText = memory.client;
            tr.appendChild(td);
            this.tbody.appendChild(tr);
        }
    }

    setSelected(id: string): void {
        if (this.selected) {
            document.getElementById(this.selected).classList.remove('selected');
            (document.getElementById('check_' + this.selected) as HTMLInputElement).checked = false;
        }
        if (id === this.selected) {
            this.selected = '';
            return;
        }
        document.getElementById(id).classList.add('selected');
        (document.getElementById('check_' + id) as HTMLInputElement).checked = true;
        this.selected = id;
    }

    addMemory(): void {
        let addMemory = new AddMemory(this);
        addMemory.open();
    }

    importTMX(): void {
        if (this.selected === '') {
            RemoteTM.showMessage('Select memory');
            return;
        }
        let importDialog: ImportTMX = new ImportTMX(this, this.selected);
        importDialog.open();
    }

    removeMemory(): void {

        if (this.selected === '') {
            RemoteTM.showMessage('Select memory');
            return;
        }
        if (this.role === Role.TRANSLATOR) {
            RemoteTM.showMessage('Access denied');
            return;
        }
        if (window.confirm('Remove selected memory?')) {
            let params: any = {
                command: 'removeMemory',
                memory: this.selected
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
                json.status === 'OK' ? this.loadMemories() : RemoteTM.showMessage(json.reason);
            }).catch((reason: any) => {
                console.error('Error:', reason);
            });
        }
    }

    exportTMX(): void {
        if (this.selected === '') {
            RemoteTM.showMessage('Select memory');
            return;
        }
        if (this.role === Role.TRANSLATOR) {
            RemoteTM.showMessage('Access denied');
            return;
        }
        let params: any = {
            command: 'openMemory',
            memory: this.selected
        }
        this.setStatus('Opening memory...');
        fetch(RemoteTM.getMainURL() + '/memories', {
            method: 'POST',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ],
            body: JSON.stringify(params)
        }).then(async (response: Response) => {
            this.setStatus('');
            let json: any = await response.json();
            json.status === 'OK' ? this.requestExport() : RemoteTM.showMessage(json.reason);
        }).catch((reason: any) => {
            this.setStatus('');
            console.error('Error:', reason);
        });
    }

    requestExport(): void {
        let params: any = {
            command: 'exportMemory',
            memory: this.selected,
            srcLang: '*all*',
            close: true
        }
        this.setStatus('Preparing download...');
        fetch(RemoteTM.getMainURL() + '/memories', {
            method: 'POST',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ],
            body: JSON.stringify(params)
        }).then(async (response: Response) => {
            this.setStatus('');
            let json: any = await response.json();
            json.status === 'OK' ? this.downloadMemory(json.file) : RemoteTM.showMessage(json.reason);
        }).catch((reason: any) => {
            this.setStatus('');
            console.error('Error:', reason);
        });
    }

    downloadMemory(file: string) {
        window.open(RemoteTM.getMainURL() + '/download?session=' +
            encodeURIComponent(RemoteTM.getSession()) +
            '&file=' +
            encodeURIComponent(file));
    }

    setStatus(status: string) {
        let statusDiv: HTMLDivElement = document.getElementById('status') as HTMLDivElement;
        statusDiv.innerText = status;
        statusDiv.style.display = status === '' ? 'none' : 'block';
    }

    closeMemories(): void {
        if (this.role !== Role.SYSTEM_ADMINISTRATOR) {
            RemoteTM.showMessage('Access denied');
            return;
        }
        let params: any = {
            command: 'closeMemories'
        }
        this.setStatus('Closing memories...');
        fetch(RemoteTM.getMainURL() + '/memories', {
            method: 'POST',
            headers: [
                ['Session', RemoteTM.getSession()],
                ['Content-Type', 'application/json'],
                ['Accept', 'application/json']
            ],
            body: JSON.stringify(params)
        }).then(async (response: Response) => {
            this.setStatus('');
            let json: any = await response.json();
            json.status === 'OK' ? this.loadMemories() : RemoteTM.showMessage(json.reason);
        }).catch((reason: any) => {
            this.setStatus('');
            console.error('Error:', reason);
        });
    }
}