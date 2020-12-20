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
