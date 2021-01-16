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

import java.io.Serializable;
import java.util.Date;

public class Memory implements Serializable {

	private static final long serialVersionUID = -3800311066779683003L;
	private String name;
	private String owner;
	private String project;
	private String subject;
	private String client;
	private Date creationDate;
	private boolean open;
	private long size;

	public Memory(String name, String owner, String project, String subject, String client, Date creationDate) {
		this.name = name;
		this.owner = owner;
		this.project = project;
		this.subject = subject;
		this.client = client;
		this.creationDate = creationDate;
	}
	
	public String getName() {
		return name;
	}

	public String getOwner() {
		return owner;
	}

	public String getProject() {
		return project;
	}

	public void setProject(String project) {
		this.project = project;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getClient() {
		return client;
	}

	public void setClient(String client) {
		this.client = client;
	}

	public Date getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Date creationDate) {
		this.creationDate = creationDate;
	}
	
	public boolean isOpen() {
		return open;
	}
	
	public void setOpen(boolean value) {
		open = value;
	}

	public void setSize(long value) {
		size = value;
	}
	
	public String getSize() {
		return "" + size;
	}
}
