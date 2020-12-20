/*******************************************************************************
Copyright (c) 2008-2020 - Maxprograms,  http://www.maxprograms.com/

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
package com.maxprograms.remotetm.utils;

import java.io.IOException;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.nio.charset.StandardCharsets;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;

public class SecurityFilter implements Filter {

	private static Logger logger = System.getLogger(SecurityFilter.class.getName());
	
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		HttpServletResponse res = (HttpServletResponse) response;
		
		res.addHeader("X-FRAME-OPTIONS", "sameorigin");
		res.addHeader("X-XSS-Protection", "1; mode=block");
		res.addHeader("X-Content-Type-Options", "nosniff");
		res.addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		res.addHeader("Pragma", "no-cache");
		res.addHeader("Expires", "-1");
		res.addHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
		res.addHeader("X-Permitted-Cross-Domain-Policies", "master-only");
		res.addHeader("Content-Security-Policy", "report-uri https://dev.maxprograms.com");
		res.addHeader("Referrer-Policy", "no-referrer-when-downgrade");
		res.addHeader("Feature-Policy", "microphone 'none'; camera 'none'");

		res.setCharacterEncoding(StandardCharsets.UTF_8.name());
		res.setContentType("text/html;charset=utf-8");
		try {
			chain.doFilter(request, response);
		} catch (IOException e) {
			logger.log(Level.ERROR, Constants.ERROR, e);
		}
	}

	@Override
	public void destroy() {
		// do nothing
	}

	@Override
	public void init(FilterConfig filterConfig) {		
		// do nothing
	}
}