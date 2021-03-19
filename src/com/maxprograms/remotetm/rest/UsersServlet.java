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
import java.net.URL;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.DbManager;
import com.maxprograms.remotetm.models.User;
import com.maxprograms.remotetm.utils.Utils;

import org.json.JSONArray;
import org.json.JSONObject;

public class UsersServlet extends HttpServlet {

    private static final long serialVersionUID = 1274203013996176701L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        JSONObject result = new JSONObject();
        response.setContentType("application/json");
        StringBuffer from = request.getRequestURL();
        URL url = new URL(from.toString());
        if (!Constants.HTTPS.equals(url.getProtocol())) {
            result.put(Constants.STATUS, Constants.ERROR);
            result.put(Constants.REASON, Constants.DENIED);
            Utils.writeResponse(result, response, 401);
            return;
        }
        String session = request.getHeader("Session");
        if (AuthorizeServlet.sessionActive(session)) {
            try {
                DbManager manager = DbManager.getInstance();
                User who = manager.getUser(AuthorizeServlet.getUser(session));
                if (who != null && who.isActive() && Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole())) {
                    JSONArray array = new JSONArray();
                    List<User> users = manager.getUsers();
                    Iterator<User> it = users.iterator();
                    while (it.hasNext()) {
                        array.put(it.next().toJSON());
                    }
                    result.put(Constants.STATUS, Constants.OK);
                    result.put("users", array);
                    Utils.writeResponse(result, response, 200);
                    return;
                }
            } catch (NoSuchAlgorithmException | SQLException e) {
                result.put(Constants.STATUS, Constants.ERROR);
                result.put(Constants.REASON, e.getMessage());
                Utils.writeResponse(result, response, 500);
            }
        }
        result.put(Constants.STATUS, Constants.ERROR);
        result.put(Constants.REASON, Constants.DENIED);
        Utils.writeResponse(result, response, 401);
    }
}
