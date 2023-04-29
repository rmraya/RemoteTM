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

export class DropZone {

    dropArea: HTMLDivElement;
    fileInput: HTMLInputElement;
    fileName: HTMLParagraphElement;

    constructor(parent: HTMLElement) {

        this.dropArea = document.createElement('div');
        this.dropArea.classList.add('dropZone');
        this.dropArea.addEventListener('dragover', (ev: DragEvent) => { this.dragOverHandler(ev); });
        this.dropArea.addEventListener('dragleave', () => { this.dragExitHandler(); });
        this.dropArea.addEventListener('drop', (ev: DragEvent) => { this.dropHandler(ev); });
        parent.appendChild(this.dropArea);

        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = '.tmx,.zip';
        let id = 'file' + (Math.random() * 10000000);
        this.fileInput.id = id;
        this.fileInput.classList.add('hidden');
        this.fileInput.addEventListener('input', (ev: InputEvent) => { this.inputHandler(ev); });
        this.dropArea.appendChild(this.fileInput);

        let span:HTMLSpanElement = document.createElement('span');
        span.innerText='Drop files here or ';

        let inputLabel: HTMLLabelElement = document.createElement('label');
        inputLabel.innerText = 'Select File';
        inputLabel.htmlFor = id;
        span.appendChild(inputLabel);
        this.dropArea.appendChild(span);

        this.fileName = document.createElement('p');
        this.dropArea.appendChild(this.fileName);
    }

    dragOverHandler(event: DragEvent): void {
        event.preventDefault();
        this.dropArea.classList.add('dragOver');
    }

    dragExitHandler(): void {
        this.dropArea.classList.remove('dragOver');
    }

    dropHandler(event: DragEvent): void {
        if (event.dataTransfer.files) {
            event.preventDefault();
            this.fileInput.files = event.dataTransfer.files;
            if (this.fileInput.files) {
                this.fileName.innerText = this.fileInput.files[0].name;
            }
            this.dropArea.classList.remove('dragOver');
        }
    }

    inputHandler(event: InputEvent): void {
        if (this.fileInput.files) {
            this.fileName.innerText = this.fileInput.files[0].name;
        }
    }

    getFiles(): FileList {
        return this.fileInput.files;
    }
}