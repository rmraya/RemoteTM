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

package com.maxprograms.remotetm.models;

import org.json.JSONObject;

public class Permission implements Comparable<Permission> {

	private String user;
	private String memory;
	private boolean read;
	private boolean write;
	private boolean export;

	public Permission(String user, String memory, boolean read, boolean write, boolean export) {
		this.user = user;
		this.memory = memory;
		this.read = read;
		this.write = write;
		this.export = export;
	}

	public String getUser() {
		return user;
	}

	public String getMemory() {
		return memory;
	}

	public boolean canRead() {
		return read;
	}

	public void setRead(boolean read) {
		this.read = read;
	}

	public boolean canWrite() {
		return write;
	}

	public void setWrite(boolean write) {
		this.write = write;
	}

	public boolean canExport() {
		return export;
	}

	public void setExport(boolean export) {
		this.export = export;
	}

	public JSONObject toJSON() {
		JSONObject json = new JSONObject();
		json.put("memory", memory);
		json.put("user", user);
		json.put("read", read);
		json.put("write", write);
		json.put("export", export);
		return json;
	}

	private int access() {
		int access = 0;
		access += read ? 4 : 0;
		access += write ? 2 : 0;
		access += export ? 1 : 0;
		return access;
	}

	@Override
	public int compareTo(Permission o) {
		if (access() > o.access()) {
			return -1;
		}
		if (access() < o.access()) {
			return 1;
		}
		return user.compareToIgnoreCase(o.user);
	}

	@Override
	public boolean equals(Object obj) {
		if (obj instanceof Permission) {
			Permission p = (Permission) obj;
			return user.equals(p.user) && memory.equals(p.memory) && access() == p.access();
		}
		return false;
	}

	@Override
	public int hashCode() {
		return user.hashCode() * memory.hashCode() * access();
	}
}
