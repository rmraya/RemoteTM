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
import { Dialog } from './dialog';
import { View } from './view';

export class Dashboard implements View {

    private static openDialogs: Map<string, Dialog>;

    constructor() {
        // TODO

        let mainContent: HTMLDivElement = document.getElementById('mainContent') as HTMLDivElement;

        const config: MutationObserverInit = { attributes: false, childList: true, subtree: false };
        const callback = (mutationsList: MutationRecord[], observer: MutationObserver): void => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    let added: NodeList = mutation.addedNodes;
                    if (added.length > 0) {
                        this.resize();
                    }
                }
            }
        };
        let observer: MutationObserver = new MutationObserver(callback);
        observer.observe(mainContent, config);
    }

    show(): void {
        // TODO
    }

    close(): void {
        // TODO
    }

    resize(): void {
        // TODO
    }

    static registerDialog(dialog: Dialog): void {
        if (!Dashboard.openDialogs) {
            Dashboard.openDialogs = new Map<string, Dialog>();
        }
        Dashboard.openDialogs.set(dialog.getId(), dialog);
    }

    static removeDialog(dialog: Dialog): void {
        Dashboard.openDialogs.delete(dialog.getId());
    }
}