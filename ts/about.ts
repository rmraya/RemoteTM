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
        p.innerHTML = 'Copyright &copy; 2008-2022 Maxprograms';
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