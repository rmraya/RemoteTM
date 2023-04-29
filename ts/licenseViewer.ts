/*******************************************************************************
 * Copyright (c) 2008-2023 Maxprograms.
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

export class LicenseViewer {
    
    dialog: Dialog;
    
    constructor(title: string, license: string) {
        this.dialog = new Dialog(750);
        this.dialog.setTitle(title);
        this.dialog.position(60, 110);

        let divContainer: HTMLDivElement = document.createElement('div');
        divContainer.classList.add('divContainer');
        divContainer.style.height='400px';
        divContainer.style.width='750px';
        this.dialog.appendChild(divContainer);

        let content: HTMLElement= document.createElement(license.endsWith('html') ? 'div' : 'pre');
        content.style.padding = '16px';
        divContainer.appendChild(content);

        fetch(RemoteTM.getMainURL() + license, {
            method: 'GET',
            headers: [
                ['Accept', 'text/html']
            ]
        }).then(async (response: Response) => {
            let text: any = await response.text();
            content.innerHTML = text;
        }).catch((reason: any) => {
            console.error('Error:', reason);
        });
    }

    open(): void {
        this.dialog.open();
    }
}