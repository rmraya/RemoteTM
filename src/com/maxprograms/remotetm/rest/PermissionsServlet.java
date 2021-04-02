
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

import java.io.IOException;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.DbManager;
import com.maxprograms.remotetm.models.Permission;
import com.maxprograms.remotetm.models.User;
import com.maxprograms.remotetm.utils.Utils;

import org.json.JSONArray;
import org.json.JSONObject;

public class PermissionsServlet extends HttpServlet {

    private static final long serialVersionUID = -217369034055674200L;
    Logger logger = System.getLogger(PermissionsServlet.class.getName());

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            if (!Utils.isSafe(request, response)) {
                return;
            }
            String memory = request.getParameter("id");
            JSONObject result = new JSONObject();
            String session = request.getHeader("Session");
            if (AuthorizeServlet.sessionActive(session)) {
                try {
                    DbManager manager = DbManager.getInstance();
                    User who = manager.getUser(AuthorizeServlet.getUser(session));
                    if (who != null && who.isActive()) {
                        String owner = manager.getOwner(memory);
                        if (who.getId().equals(owner) || Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole())) {
                            JSONArray array = new JSONArray();
                            List<Permission> list = manager.getPermissions(memory);
                            Iterator<Permission> it = list.iterator();
                            while (it.hasNext()) {
                                array.put(it.next().toJSON());
                            }
                            result.put(Constants.STATUS, Constants.OK);
                            result.put("permissions", array);
                            Utils.writeResponse(result, response, 200);
                            return;
                        }
                    }
                    Utils.denyAccess(response);
                } catch (NoSuchAlgorithmException | SQLException e) {
                    logger.log(Level.ERROR, e);
                    result.put(Constants.STATUS, Constants.ERROR);
                    result.put(Constants.REASON, e.getMessage());
                    Utils.writeResponse(result, response, 500);
                }
                return;
            }
            Utils.denyAccess(response);
        } catch (IOException e) {
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
                try {
                    JSONObject body = Utils.readJSON(request.getInputStream());
                    DbManager manager = DbManager.getInstance();
                    User who = manager.getUser(AuthorizeServlet.getUser(session));
                    if (who != null && who.isActive()) {
                        String owner = manager.getOwner(body.getString("memory"));
                        if (who.getId().equals(owner) || Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole())) {
                            manager.setPermissions(body.getString("memory"), body.getJSONArray("permissions"));
                            result.put(Constants.STATUS, Constants.OK);
                            Utils.writeResponse(result, response, 200);
                            return;
                        }
                    }
                    Utils.denyAccess(response);
                } catch (NoSuchAlgorithmException | SQLException e) {
                    logger.log(Level.ERROR, e);
                    result.put(Constants.STATUS, Constants.ERROR);
                    result.put(Constants.REASON, e.getMessage());
                    Utils.writeResponse(result, response, 500);
                }
                return;
            }
            Utils.denyAccess(response);
        } catch (IOException e) {
            logger.log(Level.ERROR, e);
        }
    }
}