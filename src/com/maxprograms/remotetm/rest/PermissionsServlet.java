/*******************************************************************************
 * Copyright (c) 2008-2021 Maxprograms.
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
                        if (owner.isEmpty()) {
                            result.put(Constants.STATUS, Constants.ERROR);
                            result.put(Constants.REASON, "Invalid memory");
                            Utils.writeResponse(result, response, 200);
                            return;
                        }
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
                        if (owner.isEmpty()) {
                            result.put(Constants.STATUS, Constants.ERROR);
                            result.put(Constants.REASON, "Invalid memory");
                            Utils.writeResponse(result, response, 200);
                            return;
                        }
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