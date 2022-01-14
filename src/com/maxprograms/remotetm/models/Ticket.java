/*******************************************************************************
 * Copyright (c) 2008-2022 Maxprograms.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 1.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/org/documents/epl-v10.html
 *
 * Contributors:
 *     Maxprograms - initial API and implementation
 *******************************************************************************/

package com.maxprograms.remotetm.models;

public class Ticket {

    private String user;
    private long lastAccess;

    public Ticket(String user) {
        this.user = user;
        this.lastAccess = System.currentTimeMillis();
    }

    public String getUser() {
        return user;
    }

    public long getLastAccess() {
        return lastAccess;
    }

    public void setLastAccess(long value) {
        lastAccess = value;
    }
}
