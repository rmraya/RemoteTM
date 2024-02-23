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

public class EmailServer  {

	private String server;
	private String port;
	private String user;
	private String passwd;
	private String from;
	private String instanceUrl;
	private boolean authRequired;
	private boolean useTLS;

	public EmailServer() {
		// empty for security
	}
	
	public EmailServer(String server, String port, String user, String passwd, String from, String url, boolean authRequired, boolean useTLS) {		
		this.server = server;
		this.port = port;
		this.user = user;
		this.passwd = passwd;
		this.from = from;
		this.instanceUrl = url;
		this.authRequired = authRequired;
		this.useTLS = useTLS;
	}

	public String getServer() {
		return server;
	}

	public void setServer(String host) {
		this.server = host;
	}

	public String getPort() {
		return port;
	}

	public void setPort(String port) {
		this.port = port;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getPasswd() {
		return passwd;
	}

	public void setPasswd(String passwd) {
		this.passwd = passwd;
	}

	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}

	public String getInstanceUrl() {
		return instanceUrl;
	}

	public void setInstanceUrl(String url) {
		this.instanceUrl = url;
	}

	public boolean isAuthRequired() {
		return authRequired;
	}

	public boolean isUseTLS() {
		return useTLS;
	}	
}
