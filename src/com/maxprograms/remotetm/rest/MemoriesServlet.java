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
import java.io.IOException;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;

import javax.mail.MessagingException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.DbManager;
import com.maxprograms.remotetm.RemoteTM;
import com.maxprograms.remotetm.models.EmailServer;
import com.maxprograms.remotetm.models.Permission;
import com.maxprograms.remotetm.models.User;
import com.maxprograms.remotetm.utils.SendMail;
import com.maxprograms.remotetm.utils.Utils;
import com.maxprograms.swordfish.models.Memory;
import com.maxprograms.swordfish.tm.InternalDatabase;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.xml.sax.SAXException;

public class MemoriesServlet extends HttpServlet {

    private static final long serialVersionUID = 6894498215572036825L;

    private static Logger logger = System.getLogger(MemoriesServlet.class.getName());

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
                    JSONArray memories = manager.getMemories(AuthorizeServlet.getUser(session));
                    result.put("memories", memories);
                    result.put(Constants.STATUS, Constants.OK);
                    Utils.writeResponse(result, response, 200);
                } catch (SQLException | NoSuchAlgorithmException e) {
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
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException {
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
                    if ("addMemory".equals(command)) {
                        addMemory(session, body);
                    }
                    if ("importTMX".equals(command)) {
                        importTMX(session, body);
                    }
                    result.put(Constants.STATUS, Constants.OK);
                    Utils.writeResponse(result, response, 200);
                } catch (SQLException | NoSuchAlgorithmException | JSONException | IOException e) {
                    logger.log(Level.ERROR, e);
                    result.put(Constants.STATUS, Constants.ERROR);
                    result.put(Constants.REASON, e.getMessage());
                    Utils.writeResponse(result, response, 200);
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

    private void addMemory(String session, JSONObject params)
            throws NoSuchAlgorithmException, IOException, SQLException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive() && !Constants.TRANSLATOR.equals(who.getRole())) {
            params.put("id", "" + System.currentTimeMillis());
            params.put("creationDate", System.currentTimeMillis());
            Memory mem = new Memory(params);
            File memoriesFolder = new File(RemoteTM.getWorkFolder(), "memories");
            InternalDatabase engine = new InternalDatabase(mem.getId(), memoriesFolder.getAbsolutePath());
            engine.close();
            manager.addMemory(mem, who);
            return;
        }
        throw new IOException(Constants.DENIED);
    }

    private void importTMX(String session, JSONObject params)
            throws SQLException, NoSuchAlgorithmException, IOException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            String memory = params.getString("memory");
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canWrite()) {
                Thread thread = new Thread() {
                    @Override
                    public void run() {
                        try {
                            File homeDir = RemoteTM.getWorkFolder();
                            File tempDir = new File(homeDir, "tmp");
                            File tmx = new File(tempDir,params.getString("file"));
                            File memoriesFolder = new File(RemoteTM.getWorkFolder(), "memories");
                            InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
                            int imported = engine.storeTMX(tmx.getAbsolutePath(), params.getString("project"),
                                    params.getString("client"), params.getString("subject"));
                            String[] to = new String[] { who.getEmail() };
                            String text = "\nDear " + who.getName() + ",\n\nYour TMX file has been processed and "
                                    + imported + " entries were added to your memory." + " \n\nThanks for using RemoteTM.\n\n";
                            String html = "<p>Dear " + who.getName() + ",</p>"
                                    + "<p>Your TMX file has been processed and " + imported
                                    + " entries were added to your memory.</p><p>Thanks for using RemoteTM.</p>";
                            try {
                                EmailServer server = Utils.getEmailServer();
                                SendMail sender = new SendMail(server);
                                sender.sendMail(to, new String[] {}, new String[] {}, "[RemoteTM] TMX imported", text,
                                        html);
                            } catch (MessagingException e) {
                                logger.log(Level.ERROR, "Error sending mail", e);
                            }
                        } catch (SQLException | JSONException | IOException | SAXException
                                | ParserConfigurationException ex) {
                            logger.log(Level.ERROR, "Error importing TMX", ex);
                        }
                    }
                };
                thread.start();
                return;
            }
        }
        throw new IOException(Constants.DENIED);
    }
}