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

export class Input {

    container: HTMLDivElement
    labelText: string;
    label: HTMLLabelElement;
    input: HTMLInputElement;

    constructor(parent: HTMLElement, label: string, type: string) {
        this.labelText = label;
        this.container = document.createElement('div');
        this.container.classList.add('inputContainer');
        parent.appendChild(this.container);

        this.label = document.createElement('label');
        this.label.innerHTML = label;
        this.label.className = 'inputLabel hiddenLabel';
        this.container.appendChild(this.label);

        this.input = document.createElement('input');
        this.input.classList.add('inputBox');
        this.input.placeholder = label;
        if ('number' === type) {
            this.input.addEventListener('keydown', (ev: KeyboardEvent) => { this.onlyNumbers(ev) });
            type = 'text';
        }
        this.input.type = type;
        this.input.addEventListener('input', () => { this.handleChanges(); });
        this.input.addEventListener('focus', () => { this.focusIn(); });
        this.input.addEventListener('blur', () => { this.focusOut(); });
        this.container.appendChild(this.input);
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

    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions): void {
        this.input.addEventListener(type, listener, options);
    }

    onlyNumbers(event: KeyboardEvent): void {
        let code: string = event.code;
        if (!(code.startsWith('Digit') || code.startsWith('Numpad') || code === 'Delete' || code === 'Backspace')) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    setList(list: string[]) {
        let datalist = document.createElement('datalist');
        datalist.id = 'list' + (Math.random() * 10000000);
        this.container.appendChild(datalist);
        this.input.setAttribute('list', datalist.id);
        let length = list.length;
        for (let i = 0; i < length; i++) {
            let option: HTMLOptionElement = document.createElement('option');
            option.value=list[i];
            datalist.appendChild(option);
        }
    }
}