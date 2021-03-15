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

export class Input {
    labelText: string;
    label: HTMLLabelElement;
    input: HTMLInputElement;

    constructor(parent: HTMLElement, label: string, type: string) {
        this.labelText = label;
        let container: HTMLDivElement = document.createElement('div');
        container.classList.add('inputContainer');
        parent.appendChild(container);

        this.label = document.createElement('label');
        this.label.innerHTML = label;
        this.label.className = 'inputLabel hiddenLabel';
        container.appendChild(this.label);

        this.input = document.createElement('input');
        this.input.classList.add('inputBox');
        this.input.placeholder = label;
        this.input.type = type;
        this.input.addEventListener('input', () => { this.handleChanges(); });
        this.input.addEventListener('focus', () => { this.focusIn(); });
        this.input.addEventListener('blur', () => { this.focusOut(); });
        container.appendChild(this.input);
    }

    handleChanges(): void {
        this.label.className = this.input.value ? 'inputLabel' : 'inputLabel hiddenLabel';
    }

    getValue(): string {
        return this.input.value;
    }

    setValue(value: string): void {
        this.input.value = value;
        this.label.className = this.input.value ? 'inputLabel' : 'inputLabel hiddenLabel';
    }

    focusIn() {
        this.label.className = 'inputLabel';
        this.input.placeholder = '';
    }

    focusOut() {
        this.label.className = this.input.value ? 'inputLabel' : 'inputLabel hiddenLabel';
        this.input.placeholder = this.labelText;
    }

    focus(): void {
        this.input.focus();
    }

    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions) : void {
        this.input.addEventListener(type, listener, options);
    }
}