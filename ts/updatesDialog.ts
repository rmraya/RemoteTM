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

import { Dialog } from "./dialog";
import { RemoteTM } from "./remotetm";

export class UpdatesDialog {

    dialog: Dialog;

    constructor() {
        this.dialog = new Dialog(480);

        let container: HTMLDivElement = document.createElement('div');
        container.classList.add('fullWidth');
        container.classList.add('center');
        this.dialog.appendChild(container);

        if (RemoteTM.VERSION !== RemoteTM.UPDATES.version || RemoteTM.BUILD !== RemoteTM.UPDATES.build) {
            this.dialog.setTitle('Updates available');

            let p: HTMLParagraphElement = document.createElement('p');
            p.innerHTML = 'RemoteTM version ' + RemoteTM.UPDATES.version + '_' + RemoteTM.UPDATES.build + ' is available';
            container.appendChild(p);

            let closeButton: HTMLButtonElement = document.createElement('button');
            closeButton.innerText = 'Open Downloads Page';
            closeButton.addEventListener('click', () => { window.open('https://maxprograms.com/products/remotetm.html', '_blank'); });
            this.dialog.addButton(closeButton);
        } else {
            let p: HTMLParagraphElement = document.createElement('p');
            p.innerHTML = 'There are currently no updates available';
            container.appendChild(p);

            let closeButton: HTMLButtonElement = document.createElement('button');
            closeButton.innerText = 'Close';
            closeButton.addEventListener('click', () => { this.dialog.close() });
            this.dialog.addButton(closeButton);
        }

    }



    open(): void {
        this.dialog.open();
    }
}