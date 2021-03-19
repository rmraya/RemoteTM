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

import { RemoteTM } from "./remotetm";

export class Dialog {

    dialog: HTMLDivElement;
    id: string;
    titleArea: HTMLDivElement;
    titleSpan: HTMLSpanElement;
    contentArea: HTMLDivElement;
    buttonArea: HTMLDivElement;
    mouseX: number;
    mouseY: number;
    closeLink: HTMLAnchorElement;
    closeAction: Function;

    constructor(width: number) {
        this.id = 'dia' + (Math.random() * 10000000);
        this.dialog = document.createElement('div');
        this.dialog.classList.add('dialog');
        this.dialog.classList.add('hidden');
        this.dialog.style.zIndex = (10 + (2 * RemoteTM.dialogCount())) + '';
        this.center(width);
        document.body.appendChild(this.dialog);
        this.titleArea = document.createElement('div');
        this.titleArea.classList.add('dialogTitle');

        this.titleSpan = document.createElement('span');
        this.titleSpan.id = 'title';
        this.titleSpan.style.width = 'calc(100% - 24px) !important';

        this.titleArea.appendChild(this.titleSpan);

        this.closeLink = document.createElement('a');
        this.closeLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">' +
            '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />' +
            '<path d="M0 0h24v24H0z" fill="none" />' +
            '</svg>';
        this.closeLink.classList.add('right');
        this.closeLink.style.marginRight = '4px';
        this.closeLink.addEventListener('click', () => {
            this.close();
        });
        this.titleArea.appendChild(this.closeLink);
        this.dialog.appendChild(this.titleArea);

        this.contentArea = document.createElement('div');
        this.dialog.appendChild(this.contentArea);

        this.buttonArea = document.createElement('div');
        this.buttonArea.classList.add('buttonArea');
        this.dialog.appendChild(this.buttonArea);
        RemoteTM.registerDialog(this);
    }

    setTitle(title: string) {
        this.titleSpan.innerText = title;
    }

    addButton(button: HTMLButtonElement): void {
        this.buttonArea.appendChild(button);
    }

    open(): void {
        this.dialog.classList.remove('hidden');
    }

    close(): void {
        this.dialog.classList.add('hidden');
        if (this.closeAction) {
            this.closeAction();
        }
        RemoteTM.removeDialog(this);
        document.body.removeChild(this.dialog);
    }

    appendChild(child: HTMLElement): void {
        this.contentArea.appendChild(child);
    }

    private center(width: number) {
        this.dialog.style.width = width + 'px';
        let screenWidth = document.body.clientWidth;
        this.dialog.style.left = ((screenWidth - width) / 2) + 'px';
        this.dialog.style.top = 'calc(15% + ' + (RemoteTM.dialogCount() * 28) + 'px)';
    }

    setLeft(left: number): void {
        this.dialog.style.left = left + 'px';
    }

    setTop(top: number): void {
        this.dialog.style.top = top + 'px';
    }

    position(left: number, top: number): void {
        this.dialog.style.left = left + 'px';
        this.dialog.style.top = top + 'px';
    }

    getId(): string {
        return this.id;
    }

    onClose(closeAction: Function) {
        this.closeAction = closeAction;
    }

    canClose(value: boolean): void {
        value ? this.closeLink.classList.remove('hidden') : this.closeLink.classList.add('hidden');
    }
}