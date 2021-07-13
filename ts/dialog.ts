/*******************************************************************************
 * Copyright (c) 2008-2021 Maxprograms.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 1.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/org/documents/epl-v10.html
 *
 * Contributors:
 *     Maxprograms - initial API and implementation
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

    mouseStartX: number;
    mouseStartY: number;
    dialogTop: number;
    dialogLeft: number;

    backdrop: HTMLDivElement;

    constructor(width: number) {
        this.backdrop = document.createElement('div');
        this.backdrop.classList.add('dialogBackdrop');
        this.backdrop.style.zIndex = (100 + (2 * RemoteTM.dialogCount())) + '';
        document.body.appendChild(this.backdrop);

        this.id = 'dia' + (Math.random() * 10000000);
        this.dialog = document.createElement('div');
        this.dialog.classList.add('dialog');
        this.dialog.classList.add('hidden');
        this.dialog.style.zIndex = (102 + (2 * RemoteTM.dialogCount())) + '';
        this.dialog.draggable = true;
        this.dialog.addEventListener('dragstart', (ev: DragEvent) => { this.dragStart(ev); });
        this.dialog.addEventListener('drag', (ev: DragEvent) => { this.drag(ev); });
        this.dialog.addEventListener('dragend', (ev: DragEvent) => { this.dragEnd(ev); })
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
        document.body.removeChild(this.backdrop);
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

    dragStart(event: DragEvent) {
        this.mouseStartX = event.clientX;
        this.mouseStartY = event.clientY;
        this.dialogTop = this.dialog.offsetTop;
        this.dialogLeft = this.dialog.offsetLeft;
        if (this.mouseStartY > this.dialogTop + this.titleArea.clientHeight) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    drag(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (event.clientX === 0 && event.clientY === 0) {
            return;
        }
        this.dialog.style.left = (this.dialogLeft - this.mouseStartX + event.clientX) + 'px';
        this.dialog.style.top = (this.dialogTop - this.mouseStartY + event.clientY) + 'px';
    }

    dragEnd(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.dialog.style.left = (this.dialogLeft - this.mouseStartX + event.clientX) + 'px';
        this.dialog.style.top = (this.dialogTop - this.mouseStartY + event.clientY) + 'px';
    }
}