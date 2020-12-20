package com.maxprograms.remotetm.models;

import java.io.Serializable;

public class Permission implements Serializable {

	private static final long serialVersionUID = -894160119064340701L;
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
	
}
