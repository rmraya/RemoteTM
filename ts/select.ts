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

export class Select {

    static DOWN: string = '<svg width="12" height="7" viewBox="0 0 12 7" xmlns="http://www.w3.org/2000/svg"><path d="M1.41 0L6 4.32659L10.59 0L12 1.33198L6 7L0 1.33198L1.41 0Z" /></svg>';
    static UP: string = '<svg width="12" height="7" viewBox="0 0 12 7" xmlns="http://www.w3.org/2000/svg"><path d="M10.59 7L6 2.67341L1.41 7L0 5.66802L6 0L12 5.66802L10.59 7Z" /></svg>';

    labelText: string;
    label: HTMLLabelElement;
    header: HTMLAnchorElement;
    optionsArray: HTMLElement[];
    backdrop: HTMLDivElement;
    showing: boolean;

    options: Map<string, HTMLOptionElement>

    value: string;
    selectedText: HTMLSpanElement;
    svg: SVGElement;

    constructor(parent: HTMLElement, label: string) {
        this.labelText = label;
        this.optionsArray = [];
        this.options = new Map<string, HTMLOptionElement>();
        this.showing = false;

        let container: HTMLDivElement = document.createElement('div');
        container.classList.add('inputContainer');
        parent.appendChild(container);

        this.label = document.createElement('label');
        this.label.innerHTML = label;
        this.label.className = 'inputLabel hiddenLabel';
        container.appendChild(this.label);

        this.header = document.createElement('a');
        this.header.classList.add('row');
        this.header.classList.add('inputBox');

        this.selectedText = document.createElement('span');
        this.selectedText.innerText = label;
        this.selectedText.classList.add('fullWidth');
        this.selectedText.classList.add('placeholder');
        this.header.appendChild(this.selectedText);

        this.svg = RemoteTM.htmlToElement(Select.DOWN) as SVGElement;
        this.header.appendChild(this.svg);

        this.header.addEventListener('click', () => { this.toggleOptions(); });
        container.appendChild(this.header);

        parent.appendChild(container);
    }

    setOptions(options: HTMLOptionElement[]) {
        options.forEach((option) => {
            let anchor: HTMLAnchorElement = document.createElement('a');
            anchor.innerText = option.innerText;
            anchor.addEventListener('click', () => {
                this.selectedText.innerText = option.innerText;
                this.value = option.value;
                this.selectedText.classList.remove('placeholder');
                this.label.classList.remove('hiddenLabel');
            });
            this.optionsArray.push(anchor);
            this.options.set(option.value, option);
        });
    }

    toggleOptions(): void {
        this.showing = !this.showing;
        if (this.showing) {
            this.backdrop = document.createElement('div');
            this.backdrop.classList.add('backdrop');
            this.backdrop.addEventListener('click', () => { this.toggleOptions(); });
            document.body.appendChild(this.backdrop);

            let options: HTMLDivElement = document.createElement('div');
            options.classList.add('dropdownOptions');
            options.classList.add('shadow');
            options.style.width = this.header.clientWidth + 'px';
            this.backdrop.appendChild(options);

            let length: number = this.optionsArray.length;
            for (let i = 0; i < length; i++) {
                options.appendChild(this.optionsArray[i]);
            }

            let parent: HTMLElement = this.header.offsetParent as HTMLElement;
            let left: number = parent.offsetLeft + this.header.offsetLeft;
            let width: number = options.clientWidth;
            if (left + width > document.body.clientWidth) {
                left = document.body.clientWidth - width - 4;
            }
            options.style.left = left + 'px';
            options.style.top = (parent.offsetTop + this.header.offsetTop + this.header.clientHeight + 4) + 'px';

            this.svg = RemoteTM.htmlToElement(Select.UP) as SVGElement;
        } else {
            document.body.removeChild(this.backdrop);
            this.svg = RemoteTM.htmlToElement(Select.DOWN) as SVGElement;
        }
    }

    getValue(): string {
        return this.value;
    }

    setValue(value: string): void {
        let option: HTMLOptionElement = this.options.get(value);
        this.selectedText.innerText = option.innerText;
        this.value = option.value;
        this.selectedText.classList.remove('placeholder');
        this.label.classList.remove('hiddenLabel');
    }
}