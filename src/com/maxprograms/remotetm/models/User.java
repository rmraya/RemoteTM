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

public class User {

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

	public JSONObject toJSON() {
		JSONObject json = new JSONObject();
		json.put("id", id);
		json.put("name", name);
		json.put("email", email);
		json.put("role", role);
		json.put("active", active);
		json.put("updated", updated);
		return json;
	}

	public String getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public void setName(String value ) {
		name = value;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String value) {
		email = value;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String value) {
		role = value;
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
