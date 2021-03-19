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

export class CheckBox {

    
    static BASE: string = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>';
    static EMPTY: string = '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>';
    static CHECKED: string = '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z"/>';

    value: boolean;
    svg: SVGElement;
    labelText: HTMLSpanElement;

    constructor(parent: HTMLElement, label: string) {
        let container: HTMLAnchorElement = document.createElement('a');
        container.classList.add('checkBox');
        container.addEventListener('click', () => { this.toggle(); });
        parent.appendChild(container);

        this.value = false;
        this.svg = RemoteTM.htmlToElement(CheckBox.BASE) as SVGElement;
        container.appendChild(this.svg);

        this.labelText = document.createElement('span');
        this.labelText.classList.add('unchecked');
        this.labelText.innerText = label;
        container.appendChild(this.labelText);
    }

    getValue(): boolean {
        return this.value;
    }

    setValue(value: boolean) {
        this.value = value;
        this.svg.innerHTML = value ? CheckBox.CHECKED : CheckBox.EMPTY;
        this.labelText.className = this.value ? '' : 'unchecked';
    }

    toggle(): void {
        this.value = !this.value;
        this.svg.innerHTML = this.value ? CheckBox.CHECKED : CheckBox.EMPTY;
        this.labelText.className = this.value ? '' : 'unchecked';
    }
}