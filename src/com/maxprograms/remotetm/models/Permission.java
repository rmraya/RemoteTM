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

}
