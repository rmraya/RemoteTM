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