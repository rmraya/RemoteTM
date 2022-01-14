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

package com.maxprograms.remotetm.rest;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.net.URL;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.utils.Utils;

import org.json.JSONObject;

public class VersionServlet extends HttpServlet {

    private static final long serialVersionUID = 9160810294370561297L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            if (!Utils.isSafe(request, response)) {
                return;
            }
            response.setContentType("application/json");
            JSONObject result = new JSONObject();
            result.put(Constants.STATUS, Constants.OK);
            result.put("version", Constants.VERSION);
            result.put("build", Constants.BUILD);
            URL home = new URL("https://maxprograms.com/remotetm.json");
            try (InputStream stream = home.openStream()) {
                try (InputStreamReader reader = new InputStreamReader(stream)) {
                    StringBuilder builder = new StringBuilder();
                    String line = "";
                    try (BufferedReader buffered = new BufferedReader(reader)) {
                        while ((line = buffered.readLine()) != null) {
                            builder.append(line);
                        }
                    }
                    result.put("updates", new JSONObject(builder.toString()));
                }
            }
            Utils.writeResponse(result, response, 200);
        } catch (IOException e) {
            Logger logger = System.getLogger(VersionServlet.class.getName());
            logger.log(Level.ERROR, e);
        }
    }
}