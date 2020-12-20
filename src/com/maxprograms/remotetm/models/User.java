package com.maxprograms.remotetm.models;

import java.io.Serializable;

public class User implements Serializable {

	private static final long serialVersionUID = -9009997310750239732L;
	private String id;
	private String name;
	private String email;
	private String role;
	private boolean active;
	private boolean updated;
	private String password;
	
	public User(String id, String password, String name, String email, String role, boolean active, boolean updated) {
		this.id = id;
		this.password = password;
		this.name = name;
		this.email = email;
		this.role = role;
		this.active = active;
		this.updated = updated;
	}

	public String getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getEmail() {
		return email;
	}

	public String getRole() {
		return role;
	}

	public void setPassword(String value) {
		password = value;
	}
	
	public String getPassword() {
		return password;
	}

	public boolean isActive() {
		return active;
	}
	
	public void setActive(boolean value) {
		active = value;
	}
	
	public boolean isUpdated() {
		return updated;
	}
	
	public void setUpdated(boolean value) {
		updated = value;
	}
}
