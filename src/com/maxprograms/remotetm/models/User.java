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
