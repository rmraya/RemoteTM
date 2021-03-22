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
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import javax.mail.MessagingException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.DbManager;
import com.maxprograms.remotetm.models.EmailServer;
import com.maxprograms.remotetm.models.User;
import com.maxprograms.remotetm.utils.SendMail;
import com.maxprograms.remotetm.utils.Utils;

import org.json.JSONException;
import org.json.JSONObject;

public class PasswordResetServlet extends HttpServlet {

    private static final long serialVersionUID = -1709663508608514673L;
    private static Map<String, String> tickets;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            if (!Utils.isSafe(request, response)) {
                return;
            }
            JSONObject body = Utils.readJSON(request.getInputStream());
            String command = body.getString("command");
            JSONObject result = new JSONObject();
            if ("request".equals(command)) {
                issueRequest(body);
                result.put(Constants.STATUS, Constants.OK);
            }
            if ("setPassword".equals(command)) {
                if (setPassword(body)) {
                    result.put(Constants.STATUS, Constants.OK);
                } else {
                    result.put(Constants.STATUS, Constants.ERROR);
                    result.put(Constants.REASON, "Database error");
                }
            }
            if ("getId".equals(command)) {
                String code = body.getString("code");
                if (tickets == null) {
                    tickets = new ConcurrentHashMap<>();
                }
                Set<String> keys = tickets.keySet();
                Iterator<String> it = keys.iterator();
                String id = "";
                while (it.hasNext()) {
                    String key = it.next();
                    if (tickets.get(key).equals(code)) {
                        id = key;
                        break;
                    }
                }
                if (!id.isEmpty()) {
                    result.put("id", id);
                    result.put(Constants.STATUS, Constants.OK);
                } else {
                    result.put(Constants.STATUS, Constants.ERROR);
                    result.put(Constants.REASON, "Invalid link");
                }
            }
            Utils.writeResponse(result, response, 200);
        } catch (IOException e) {
            Logger logger = System.getLogger(PasswordResetServlet.class.getName());
            logger.log(Level.ERROR, e);
        }
    }

    private boolean setPassword(JSONObject json) {
        try {
            String code = json.getString("code");
            boolean found = false;
            Set<String> keys = tickets.keySet();
            Iterator<String> it = keys.iterator();
            while (it.hasNext()) {
                String key = it.next();
                if (tickets.get(key).equals(code)) {
                    tickets.remove(key);
                    found = true;
                    break;
                }
            }
            if (found) {
                DbManager manager = DbManager.getInstance();
                manager.setPassword(json.getString("id"), json.getString("password"));
                return true;
            }
        } catch (SQLException | NoSuchAlgorithmException | IOException e) {
            // do nothing
        }
        return false;
    }

    private void issueRequest(JSONObject json) {
        try {
            DbManager manager = DbManager.getInstance();
            User user = manager.getUser(json.getString("id"));
            if (user != null && user.getEmail().equals(json.getString("email"))) {
                if (tickets == null) {
                    tickets = new ConcurrentHashMap<>();
                }
                String code = UUID.randomUUID().toString();

                tickets.put(user.getId(), code);
                EmailServer server = Utils.getEmailServer();
                SendMail sender = new SendMail(server);
                String link = server.getInstanceUrl() + "?key=" + code;

                String text = "\nDear " + user.getName()
                        + ",\n\nA password reset was requested for your RemoteTM account."
                        + "\n\nIf you did not request a password reset, simply ignore this message."
                        + "\n\nPlease create a new password using the link provided below." + "\n\n  Reset Link: "
                        + link + "\n\nThanks for using RemoteTM.\n\n";

                String html = "<p>Dear " + user.getName() + ",</p>"
                        + "<p>A password reset was requested for your RemoteTM account.</p>"
                        + "<p>If you did not request a password reset, simply ignore this message.</p>"
                        + "<p>Please create a new password using the link provided below.</p>"
                        + "<pre>  Reset Link: <a href='" + link + "'>" + link + "</a></pre>"
                        + "<p>Thanks for using RemoteTM.</p>";

                sender.sendMail(new String[] { user.getEmail() }, new String[] {}, new String[] {},
                        "[RemoteTM] Password Reset", text, html);
            }
        } catch (JSONException | SQLException | NoSuchAlgorithmException | MessagingException | IOException e) {
            // ignore
        }
    }

}
