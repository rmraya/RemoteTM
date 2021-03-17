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

import { Dialog } from "./dialog";
import { LicensesDialog } from "./licenses";
import { RemoteTM } from "./remotetm";

export class AboutDialog {

    dialog: Dialog;

    constructor() {
        this.dialog = new Dialog(300);
        this.dialog.setTitle('RemoteTM ' + RemoteTM.VERSION);

        let container: HTMLDivElement = document.createElement('div');
        container.classList.add('fullWidth');
        container.classList.add('center');
        this.dialog.appendChild(container);

        let logo: HTMLImageElement = document.createElement('img');
        logo.src = 'images/logo.png';
        logo.style.marginTop = '20px';
        container.appendChild(logo);

        let p: HTMLParagraphElement = document.createElement('p');
        p.innerHTML = 'Copyright &copy; 2008-2021 Maxprograms';
        container.appendChild(p);

        let licensesButton: HTMLButtonElement = document.createElement('button');
        licensesButton.innerText = 'Licenses';
        licensesButton.addEventListener('click', () => { this.viewLicenses(); });
        this.dialog.addButton(licensesButton);
    }

    open(): void {
        this.dialog.open();
    }

    viewLicenses(): void {
        let licenses = new LicensesDialog();
        licenses.open();
    }
}