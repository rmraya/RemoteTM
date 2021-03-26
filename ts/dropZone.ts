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


export class DropZone {

    dropArea: HTMLDivElement;
    fileInput: HTMLInputElement;
    fileName: HTMLParagraphElement;

    constructor(parent: HTMLElement) {

        this.dropArea = document.createElement('div');
        this.dropArea.classList.add('dropZone');
        this.dropArea.addEventListener('dragover', (ev: DragEvent) => { this.dragOverHandle(ev); });
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

    dragOverHandle(event: DragEvent): void {
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