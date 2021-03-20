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

public class EmailServer implements Serializable {

	private static final long serialVersionUID = 6029495600166324338L;
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
