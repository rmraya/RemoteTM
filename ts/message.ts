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

export class Message {

    constructor(message: string) {
        let container: HTMLDivElement = document.createElement('div');
        container.classList.add('message');
        container.innerText = message;
        document.body.appendChild(container);
        setTimeout(() => {
            document.body.removeChild(container);
        }, 3000);
    }
}