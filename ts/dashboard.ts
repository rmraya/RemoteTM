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

import { DropDown } from './dropdown';
import { RemoteTM } from './remotetm';
import { View } from './view';

export class Dashboard implements View {

    container: HTMLDivElement;

    constructor() {

        let mainContent: HTMLDivElement = document.getElementById('mainContent') as HTMLDivElement;

        this.container = document.createElement('div');
        this.container.classList.add('fullWidth');
        this.container.classList.add('fullHeight');
        this.container.style.background = 'var(--SECONDARY-50)';
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
        signOut.addEventListener('click', () => { RemoteTM.showLogin(); });
        topbar.appendChild(signOut);

        let toolbar: HTMLDivElement = document.createElement('div');
        toolbar.classList.add('toolbar');
        this.container.appendChild(toolbar);

        let addMemory: HTMLAnchorElement = document.createElement('a');
        addMemory.innerText = 'Add Memory';
        toolbar.appendChild(addMemory);

        let removeMemory: HTMLAnchorElement = document.createElement('a');
        removeMemory.innerText = 'Remove Memory';
        toolbar.appendChild(removeMemory);

        let setAccess: HTMLAnchorElement = document.createElement('a');
        setAccess.innerText = 'Set Access';
        toolbar.appendChild(setAccess);

        let importMemory: HTMLAnchorElement = document.createElement('a');
        importMemory.innerText = 'Import TMX';
        toolbar.appendChild(importMemory);

        let exportMemory: HTMLAnchorElement = document.createElement('a');
        exportMemory.innerText = 'Export TMX';
        toolbar.appendChild(exportMemory);

        let closeMemory: HTMLAnchorElement = document.createElement('a');
        closeMemory.innerText = 'Close Memory';
        toolbar.appendChild(closeMemory);

        let closeAllMemories: HTMLAnchorElement = document.createElement('a');
        closeAllMemories.innerText = 'Close All Memories';
        toolbar.appendChild(closeAllMemories);

        let refreshList: HTMLAnchorElement = document.createElement('a');
        refreshList.innerText = 'Refresh';
        toolbar.appendChild(refreshList);

        let tableContainer: HTMLDivElement = document.createElement('table');
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

        let memoryTh: HTMLTableHeaderCellElement = document.createElement('th');
        memoryTh.innerText = 'Memory';
        headerRow.appendChild(memoryTh);

        let ownerTh: HTMLTableHeaderCellElement = document.createElement('th');
        ownerTh.innerText = 'Owner';
        headerRow.appendChild(ownerTh);

        let creationTh: HTMLTableHeaderCellElement = document.createElement('th');
        creationTh.innerText = 'Creation Date';
        headerRow.appendChild(creationTh);

        let openTh: HTMLTableHeaderCellElement = document.createElement('th');
        openTh.innerText = 'Open';
        headerRow.appendChild(openTh);

        let projectTh: HTMLTableHeaderCellElement = document.createElement('th');
        projectTh.innerText = 'Project';
        headerRow.appendChild(projectTh);

        let subjectTh: HTMLTableHeaderCellElement = document.createElement('th');
        subjectTh.innerText = 'Subject';
        headerRow.appendChild(subjectTh);

        let ClientTh: HTMLTableHeaderCellElement = document.createElement('th');
        ClientTh.innerText = 'Client';
        headerRow.appendChild(ClientTh);

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
        let observer: MutationObserver = new MutationObserver(callback);
        observer.observe(mainContent, config);
    }

    show(): void {
        this.container.classList.remove('hidden');
        this.container.classList.add('block');
    }

    close(): void {
        this.container.classList.remove('block');
        this.container.classList.add('hidden');
    }

    resize(): void {
        // TODO
    }

    createSettingsMenu(settingsMenu: DropDown): void {
        let changePassword: HTMLAnchorElement = document.createElement('a');
        changePassword.innerText = 'Change Password';
        settingsMenu.addOption(changePassword);

        let manageUsers: HTMLAnchorElement = document.createElement('a');
        manageUsers.innerText = 'Manage Users';
        settingsMenu.addOption(manageUsers);

        let sendEmail: HTMLAnchorElement = document.createElement('a');
        sendEmail.innerText = 'Send Email';
        settingsMenu.addOption(sendEmail);

        let emailServer: HTMLAnchorElement = document.createElement('a');
        emailServer.innerText = 'Email Server';
        settingsMenu.addOption(emailServer);
    }

    createHelpMenu(helpMenu:DropDown): void {
        let help: HTMLAnchorElement = document.createElement('a');
        help.innerText = 'RemoteTM User Guide';
        help.href = RemoteTM.getMainURL() + '/docs/index.html';
        help.target = '_blank';
        helpMenu.addOption(help);

        let checkUpdates: HTMLAnchorElement = document.createElement('a');
        checkUpdates.innerText = 'Check for Updates';
        helpMenu.addOption(checkUpdates);

        let registerLicense: HTMLAnchorElement = document.createElement('a');
        registerLicense.innerText = 'Register Subscription';
        helpMenu.addOption(registerLicense);

        let supportGroup: HTMLAnchorElement = document.createElement('a');
        supportGroup.innerText = 'Support Group';
        supportGroup.href = 'https://groups.io/g/maxprograms/';
        supportGroup.target = '_blank';
        helpMenu.addOption(supportGroup);
    }
}