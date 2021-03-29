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
package com.maxprograms.remotetm.rest;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.DbManager;
import com.maxprograms.remotetm.RemoteTM;
import com.maxprograms.remotetm.models.User;
import com.maxprograms.remotetm.utils.Utils;

import org.json.JSONObject;

public class EmailServerServlet extends HttpServlet {

    private static final long serialVersionUID = -735904418329940685L;

    private static Logger logger = System.getLogger(EmailServerServlet.class.getName());

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            if (!Utils.isSafe(request, response)) {
                return;
            }
            JSONObject result = new JSONObject();
            String session = request.getHeader("Session");
            if (AuthorizeServlet.sessionActive(session)) {
                DbManager manager = DbManager.getInstance();
                User who = manager.getUser(AuthorizeServlet.getUser(session));
                if (who != null && who.isActive() && Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole())) {
                    File emailServer = new File(RemoteTM.getWorkFolder(), "mailserver.json");
                    if (!emailServer.exists()) {
                        JSONObject json = new JSONObject();
                        json.put("server", "");
                        json.put("port", "");
                        json.put("user", "");
                        json.put("password", "");
                        json.put("from", "");
                        json.put("instance", "");
                        json.put("authenticate", false);
                        json.put("tls", false);
                        try (FileOutputStream out = new FileOutputStream(emailServer)) {
                            out.write(json.toString(2).getBytes(StandardCharsets.UTF_8));
                        }
                    }
                    try (FileInputStream input = new FileInputStream(emailServer)) {
                        result = Utils.readJSON(input);
                    }
                    result.put(Constants.STATUS, Constants.OK);
                    Utils.writeResponse(result, response, 200);
                    return;
                }
            }
            Utils.denyAccess(response);
        } catch (IOException | SQLException | NoSuchAlgorithmException e) {
            logger.log(Level.ERROR, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        try {
            if (!Utils.isSafe(request, response)) {
                return;
            }
            JSONObject result = new JSONObject();
            String session = request.getHeader("Session");
            if (AuthorizeServlet.sessionActive(session)) {
                DbManager manager = DbManager.getInstance();
                User who = manager.getUser(AuthorizeServlet.getUser(session));
                if (who != null && who.isActive() && Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole())) {
                    JSONObject json = Utils.readJSON(request.getInputStream());
                    File emailServer = new File(RemoteTM.getWorkFolder(), "mailserver.json");
                    try (FileOutputStream out = new FileOutputStream(emailServer)) {
                        out.write(json.toString(2).getBytes(StandardCharsets.UTF_8));
                    }
                    result.put(Constants.STATUS, Constants.OK);
                    Utils.writeResponse(result, response, 200);
                    return;
                }
            }
            Utils.denyAccess(response);
        } catch (IOException | SQLException | NoSuchAlgorithmException e) {
            logger.log(Level.ERROR, e);
        }
    }
}
