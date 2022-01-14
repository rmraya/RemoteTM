/*******************************************************************************
 * Copyright (c) 2008-2022 Maxprograms.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 1.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/org/documents/epl-v10.html
 *
 * Contributors:
 *     Maxprograms - initial API and implementation
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

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		HttpServletResponse res = (HttpServletResponse) response;

		res.addHeader("X-Content-Type-Options", "nosniff");
		res.addHeader("Cache-Control", "no-cache");
		res.addHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
		res.addHeader("X-Permitted-Cross-Domain-Policies", "master-only");
		res.addHeader("Content-Security-Policy", "default-src https: 'self' 'unsafe-inline'");
		res.addHeader("Referrer-Policy", "no-referrer-when-downgrade");
		res.setCharacterEncoding(StandardCharsets.UTF_8.name());
		try {
			chain.doFilter(request, response);
		} catch (IOException e) {
			Logger logger = System.getLogger(SecurityFilter.class.getName());
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