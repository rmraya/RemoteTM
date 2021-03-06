export class DropDown {

    container: HTMLDivElement;
    header: HTMLAnchorElement;
    options: HTMLDivElement;
    backdrop: HTMLDivElement;

    constructor(parent: HTMLElement) {
        this.container = document.createElement('div');
        this.container.classList.add('dropdown');

        this.header = document.createElement('a');
        this.header.addEventListener('click', () => { this.toggleOptions(); });
        this.container.appendChild(this.header);

        this.backdrop = document.createElement('div');
        this.backdrop.classList.add('backdrop');
        this.backdrop.classList.add('hidden');
        document.body.appendChild(this.backdrop);

        this.options = document.createElement('div');
        this.options.classList.add('dropdownOptions');
        this.options.classList.add('shadow');
        this.backdrop.addEventListener('click', () => { this.toggleOptions(); });
        this.backdrop.appendChild(this.options);

        parent.appendChild(this.container);
    }

    setHeaderText(header: string): void {
        this.header.innerHTML = header + '&nbsp;<svg width="12" height="7" viewBox="0 0 12 7" xmlns="http://www.w3.org/2000/svg"><path d="M1.41 0L6 4.32659L10.59 0L12 1.33198L6 7L0 1.33198L1.41 0Z" /></svg>';
    }

    addOption(option: HTMLAnchorElement): void {
        this.options.appendChild(option);
    }

    toggleOptions(): void {
        if (this.backdrop.classList.contains('hidden')) {
            this.backdrop.classList.remove('hidden');
            let left: number = this.header.offsetLeft;
            let width: number = this.options.clientWidth;
            if (left + width > document.body.clientWidth) {
                left = document.body.clientWidth - width - 4;
            }
            this.options.style.left = left + 'px';
            this.options.style.top = (this.header.clientTop + this.header.clientHeight) + 'px';
        } else {
            this.backdrop.classList.add('hidden');
        }
    }
}