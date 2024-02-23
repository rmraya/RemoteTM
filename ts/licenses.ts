/*******************************************************************************
 * Copyright (c) 2008-2024 Maxprograms.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 1.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/org/documents/epl-v10.html
 *
 * Contributors:
 *     Maxprograms - initial API and implementation
 *******************************************************************************/

import { Dialog } from "./dialog";
import { LicenseViewer } from "./licenseViewer";

export class LicensesDialog {

    dialog: Dialog;

    constructor() {
        this.dialog = new Dialog(480);
        this.dialog.setTitle('Licenses');

        let holder: HTMLDivElement = document.createElement('div');
        holder.style.width = 'calc(100% - 32px)';
        holder.style.padding = '16px';
        this.dialog.appendChild(holder);

        let table: HTMLTableElement = document.createElement('table');
        holder.appendChild(table);

        let tr0: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(tr0);

        let left0: HTMLTableCellElement = document.createElement('td');
        left0.classList.add('noWrap');
        left0.innerText = 'RemoteTM';
        tr0.appendChild(left0);

        let right0: HTMLTableCellElement = document.createElement('td');
        right0.classList.add('noWrap');
        tr0.appendChild(right0);

        let remoteTm: HTMLAnchorElement = document.createElement('a');
        remoteTm.innerText = 'Eclipse Publice License 1.0';
        remoteTm.addEventListener('click', () => { this.viewLicense('Eclipse Publice License 1.0', '/licenses/EclipsePublicLicense1.0.html') });
        right0.appendChild(remoteTm);

        let tr1: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(tr1);

        let left1: HTMLTableCellElement = document.createElement('td');
        left1.innerText = 'Swordfish';
        left1.classList.add('noWrap');
        tr1.appendChild(left1);

        let right1: HTMLTableCellElement = document.createElement('td');
        right1.classList.add('noWrap');
        tr1.appendChild(right1);

        let swordfish: HTMLAnchorElement = document.createElement('a');
        swordfish.innerText = 'Eclipse Publice License 1.0';
        swordfish.addEventListener('click', () => { this.viewLicense('Eclipse Publice License 1.0', '/licenses/EclipsePublicLicense1.0.html') });
        right1.appendChild(swordfish);

        let tr2: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(tr2);

        let left2: HTMLTableCellElement = document.createElement('td');
        left2.innerText = 'TypeScript';
        left2.classList.add('noWrap');
        tr2.appendChild(left2);

        let right2: HTMLTableCellElement = document.createElement('td');
        right2.classList.add('noWrap');
        tr2.appendChild(right2);

        let typeScript: HTMLAnchorElement = document.createElement('a');
        typeScript.innerText = 'Apache License 2.0';
        typeScript.addEventListener('click', () => { this.viewLicense('Apache License 2.0', '/licenses/Apache2.0.html') });
        right2.appendChild(typeScript);

        let tr3: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(tr3);

        let left3: HTMLTableCellElement = document.createElement('td');
        left3.innerText = 'Java SE';
        left3.classList.add('noWrap');
        tr3.appendChild(left3);

        let right3: HTMLTableCellElement = document.createElement('td');
        right3.classList.add('noWrap');
        tr3.appendChild(right3);

        let java: HTMLAnchorElement = document.createElement('a');
        java.innerText = 'GPL2 with Classpath Exception';
        java.addEventListener('click', () => { this.viewLicense('GPL2 with Classpath Exception', '/licenses/java.html') });
        right3.appendChild(java);

        let tr4: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(tr4);

        let left4: HTMLTableCellElement = document.createElement('td');
        left4.innerText = 'OpenXLIFF Filters';
        left4.classList.add('noWrap');
        tr4.appendChild(left4);

        let right4: HTMLTableCellElement = document.createElement('td');
        right4.classList.add('noWrap');
        tr4.appendChild(right4);

        let openXliff: HTMLAnchorElement = document.createElement('a');
        openXliff.innerText = 'Eclipse Publice License 1.0';
        openXliff.addEventListener('click', () => { this.viewLicense('Eclipse Publice License 1.0', '/licenses/EclipsePublicLicense1.0.html') });
        right4.appendChild(openXliff);

        let tr5: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(tr5);

        let left5: HTMLTableCellElement = document.createElement('td');
        left5.innerText = 'XMLJava';
        left5.classList.add('noWrap');
        tr5.appendChild(left5);

        let right5: HTMLTableCellElement = document.createElement('td');
        right5.classList.add('noWrap');
        tr5.appendChild(right5);

        let xmljava: HTMLAnchorElement = document.createElement('a');
        xmljava.innerText = 'Eclipse Publice License 1.0';
        xmljava.addEventListener('click', () => { this.viewLicense('Eclipse Publice License 1.0', '/licenses/EclipsePublicLicense1.0.html') });
        right5.appendChild(xmljava);

        let tr6: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(tr6);

        let left6: HTMLTableCellElement = document.createElement('td');
        left6.innerText = 'SQLite';
        left6.classList.add('noWrap');
        tr6.appendChild(left6);

        let right6: HTMLTableCellElement = document.createElement('td');
        right6.classList.add('noWrap');
        tr6.appendChild(right6);

        let sqlite: HTMLSpanElement = document.createElement('span');
        sqlite.innerText = 'Public Domain';
        right6.appendChild(sqlite);

        let tr7: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(tr7);

        let left7: HTMLTableCellElement = document.createElement('td');
        left7.innerText = 'JSON';
        left7.classList.add('noWrap');
        tr7.appendChild(left7);

        let right7: HTMLTableCellElement = document.createElement('td');
        right7.classList.add('noWrap');
        tr7.appendChild(right7);

        let json: HTMLAnchorElement = document.createElement('a');
        json.innerText = 'JSON.org';
        json.addEventListener('click', () => { this.viewLicense('JSON.org', '/licenses/json.txt') });
        right7.appendChild(json);

        let tr8: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(tr8);

        let left8: HTMLTableCellElement = document.createElement('td');
        left8.innerText = 'MapDB';
        left8.classList.add('noWrap');
        tr8.appendChild(left8);

        let right8: HTMLTableCellElement = document.createElement('td');
        right8.classList.add('noWrap');
        tr8.appendChild(right8);

        let mapDb: HTMLAnchorElement = document.createElement('a');
        mapDb.innerText = 'Apache License 2.0';
        mapDb.addEventListener('click', () => { this.viewLicense('Apache License 2.0', '/licenses/Apache2.0.html') });
        right8.appendChild(mapDb);

        let tr9: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(tr9);

        let left9: HTMLTableCellElement = document.createElement('td');
        left9.innerText = 'jsoup';
        left9.classList.add('noWrap');
        tr9.appendChild(left9);

        let right9: HTMLTableCellElement = document.createElement('td');
        right9.classList.add('noWrap');
        tr9.appendChild(right9);

        let jsoup: HTMLAnchorElement = document.createElement('a');
        jsoup.innerText = 'MIT License';
        jsoup.addEventListener('click', () => { this.viewLicense('MIT License', '/licenses/jsoup.txt') });
        right9.appendChild(jsoup);

        let tr10: HTMLTableRowElement = document.createElement('tr');
        table.appendChild(tr10);

        let left10: HTMLTableCellElement = document.createElement('td');
        left10.innerText = 'DTDParser';
        left10.classList.add('noWrap');
        tr10.appendChild(left10);

        let right10: HTMLTableCellElement = document.createElement('td');
        right10.classList.add('noWrap');
        tr10.appendChild(right10);

        let dtdParser: HTMLAnchorElement = document.createElement('a');
        dtdParser.innerText = 'LGPL 2.1';
        dtdParser.addEventListener('click', () => { this.viewLicense('LGPL 2.1', '/licenses/LGPL2.1.txt') });
        right10.appendChild(dtdParser);
    }

    open(): void {
        this.dialog.open();
    }

    viewLicense(title: string, license: string): void {
        let viewer: LicenseViewer = new LicenseViewer(title, license);
        viewer.open();
    }
}