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

import javax.mail.MessagingException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.DbManager;
import com.maxprograms.remotetm.models.EmailServer;
import com.maxprograms.remotetm.models.User;
import com.maxprograms.remotetm.utils.SendMail;
import com.maxprograms.remotetm.utils.Utils;

import org.json.JSONArray;
import org.json.JSONObject;

public class UsersServlet extends HttpServlet {

    private static final long serialVersionUID = 1274203013996176701L;
    private static Logger logger = System.getLogger(UsersServlet.class.getName());

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            if (!Utils.isSafe(request, response)) {
                return;
            }
            JSONObject result = new JSONObject();
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
                    }
                } catch (NoSuchAlgorithmException | SQLException e) {
                    logger.log(Level.ERROR, e);
                    result.put(Constants.STATUS, Constants.ERROR);
                    result.put(Constants.REASON, e.getMessage());
                    Utils.writeResponse(result, response, 500);
                }
                return;
            }
            result.put(Constants.STATUS, Constants.ERROR);
            result.put(Constants.REASON, Constants.DENIED);
            Utils.writeResponse(result, response, 401);
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
                    String command = body.getString("command");
                    switch (command) {
                    case "addUser":
                        addUser(session, body);
                        break;
                    case "getUser":
                        result.put("user", getUser(session, body));
                        break;
                    case "updateUser":
                        updateUser(session, body);
                        break;
                    case "removeUser":
                        removeUser(session, body);
                        break;
                    case "toggleLock":
                        toggleLock(session, body);
                        break;
                    default:
                        result.put(Constants.STATUS, Constants.ERROR);
                        result.put(Constants.REASON, Constants.DENIED);
                        Utils.writeResponse(result, response, 401);
                        return;
                    }
                    result.put(Constants.STATUS, Constants.OK);
                    Utils.writeResponse(result, response, 200);
                } catch (IOException | NoSuchAlgorithmException | SQLException | MessagingException e) {
                    logger.log(Level.ERROR, e);
                    result.put(Constants.STATUS, Constants.ERROR);
                    result.put(Constants.REASON, e.getMessage());
                    Utils.writeResponse(result, response, 500);
                }
                return;
            }
            result.put(Constants.STATUS, Constants.ERROR);
            result.put(Constants.REASON, Constants.DENIED);
            Utils.writeResponse(result, response, 401);
        } catch (

        IOException e) {
            logger.log(Level.ERROR, e);
        }
    }

    private void updateUser(String session, JSONObject body)
            throws NoSuchAlgorithmException, SQLException, IOException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (!Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole())) {
            throw new IOException(Constants.DENIED);
        }
        User user = manager.getUser(body.getString("id"));
        user.setName(body.getString("name"));
        user.setRole(body.getString("role"));
        user.setEmail(body.getString("email"));
        manager.updateUser(user);
    }

    private void toggleLock(String session, JSONObject body)
            throws NoSuchAlgorithmException, IOException, SQLException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (!Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole())) {
            throw new IOException(Constants.DENIED);
        }
        User user = manager.getUser(body.getString("id"));
        user.setActive(!user.isActive());
        manager.updateUser(user);
    }

    private JSONObject getUser(String session, JSONObject body)
            throws SQLException, NoSuchAlgorithmException, IOException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (!Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole())) {
            throw new IOException(Constants.DENIED);
        }
        User user = manager.getUser(body.getString("id"));
        return user.toJSON();
    }

    private void addUser(String session, JSONObject body)
            throws NoSuchAlgorithmException, IOException, SQLException, MessagingException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (!Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole())) {
            throw new IOException(Constants.DENIED);
        }
        String password = Utils.generatePassword();
        User user = new User(body.getString("id"), password, body.getString("name"), body.getString("email"),
                body.getString("role"), true, false);
        EmailServer server = Utils.getEmailServer();
        SendMail sender = new SendMail(server);
        manager.addUser(user);

        String text = "\nDear " + user.getName() + ",\n\nA new account has been created for you in RemoteTM."
                + "\n\nPlease login to the server using the credentials provided below.\n\n" + "  RemoteTM Server: "
                + server.getInstanceUrl() + "\n  User Name: " + user.getId() + "\n  Code: " + password
                + " \n\nThanks for using RemoteTM.\n\n";

        String html = "<p>Dear " + user.getName() + ",</p>"
                + "<p>A new account has been created for you in RemoteTM.</p>"
                + "<p>Please login to the server using the credentials provided below.</p>" + "<pre>  RemoteTM Server: "
                + server.getInstanceUrl() + "\n  User Name: " + user.getId() + "\n  Code: " + password + "</pre>"
                + "<p>Thanks for using RemoteTM.</p>";
        try {
            sender.sendMail(new String[] { user.getEmail() }, new String[] {}, new String[] {},
                    "[RemoteTM] New Account", text, html);
        } catch (MessagingException e) {
            manager.rollback();
            throw e;
        }
        manager.commit();
    }

    private void removeUser(String session, JSONObject body)
            throws NoSuchAlgorithmException, IOException, SQLException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (!Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole())) {
            throw new IOException(Constants.DENIED);
        }
        manager.removeUser(body.getString("id"));
    }
}
