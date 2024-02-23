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

export class Role {

    public static TRANSLATOR: string = 'TR';
    public static PROJECT_MANAGER: string = 'PM';
    public static SYSTEM_ADMINISTRATOR: string = 'SA';

    public static getDescription(role: string): string {
        switch (role) {
            case Role.SYSTEM_ADMINISTRATOR: return 'System Administrator';
            case Role.PROJECT_MANAGER: return 'Project Manager';
            case Role.TRANSLATOR: return 'Translator';
            default: return undefined;
        }
    }
}