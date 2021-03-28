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
import java.util.Iterator;
import java.util.Set;
import java.util.TreeSet;

import javax.mail.MessagingException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.DbManager;
import com.maxprograms.remotetm.RemoteTM;
import com.maxprograms.remotetm.TmManager;
import com.maxprograms.remotetm.models.EmailServer;
import com.maxprograms.remotetm.models.Permission;
import com.maxprograms.remotetm.models.User;
import com.maxprograms.remotetm.utils.SendMail;
import com.maxprograms.remotetm.utils.Utils;
import com.maxprograms.swordfish.models.Memory;

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
                    for (int i = 0; i < memories.length(); i++) {
                        JSONObject memory = memories.getJSONObject(i);
                        memories.getJSONObject(i).put("open", TmManager.isOpen(memory.getString("id")));
                    }
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
            Utils.denyAccess(response);
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
                    switch (command) {
                    case "addMemory":
                        addMemory(session, body);
                        break;
                    case "importTMX":
                        importTMX(session, body);
                        break;
                    case "getProjects":
                        result.put("projects", getProperty(session, "project"));
                        break;
                    case "getSubjects":
                        result.put("subjects", getProperty(session, "subject"));
                        break;
                    case "getClients":
                        result.put("clients", getProperty(session, "client"));
                        break;
                    case "removeMemory":
                        removeMemory(session, body);
                        break;
                    case "exportMemory":
                        result.put("file", exportMemory(session, body));
                        break;
                    default:
                        Utils.denyAccess(response);
                        return;
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
            Utils.denyAccess(response);
        } catch (IOException e) {
            logger.log(Level.ERROR, e);
        }
    }

    private String exportMemory(String session, JSONObject params)
            throws SQLException, NoSuchAlgorithmException, IOException {
        String memory = params.getString("memory");
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            Memory mem = manager.getMemory(memory);
            if (Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole())) {
                return TmManager.exportMemory(memory, mem.getName());
            }
            String owner = manager.getOwner(memory);
            if (who.getId().equals(owner)) {
                return TmManager.exportMemory(memory, mem.getName());
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private void removeMemory(String session, JSONObject params)
            throws SQLException, NoSuchAlgorithmException, IOException {
        String memory = params.getString("memory");
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            if (Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole())) {
                TmManager.removeMemory(memory);
                manager.removeMemory(memory);
                return;
            }
            String owner = manager.getOwner(memory);
            if (who.getId().equals(owner)) {
                TmManager.removeMemory(memory);
                manager.removeMemory(memory);
                return;
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private void addMemory(String session, JSONObject params)
            throws NoSuchAlgorithmException, IOException, SQLException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive() && !Constants.TRANSLATOR.equals(who.getRole())) {
            params.put("id", "" + System.currentTimeMillis());
            params.put("creationDate", System.currentTimeMillis());
            Memory mem = new Memory(params);
            TmManager.createMemory(mem.getId());
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
            Memory mem = manager.getMemory(memory);
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canWrite()) {
                Thread thread = new Thread() {
                    @Override
                    public void run() {
                        try {
                            File tempDir = new File(RemoteTM.getWorkFolder(), "tmp");
                            File tmx = new File(tempDir, params.getString("file"));
                            int imported = TmManager.storeTMX(memory, tmx.getAbsolutePath(),
                                    params.getString("project"), params.getString("client"),
                                    params.getString("subject"));
                            String text = "\nDear " + who.getName() + ",\n\nYour TMX file has been processed and "
                                    + imported + " entries were added to \"" + mem.getName()
                                    + "\".\n\nThanks for using RemoteTM.\n\n";
                            String html = "<p>Dear " + who.getName() + ",</p>"
                                    + "<p>Your TMX file has been processed and <b>" + imported
                                    + "</b> entries were added to <b>" + mem.getName()
                                    + "</b>.</p><p>Thanks for using RemoteTM.</p>";
                            try {
                                EmailServer server = Utils.getEmailServer();
                                SendMail sender = new SendMail(server);
                                sender.sendMail(new String[] { who.getEmail() }, new String[] {}, new String[] {},
                                        "[RemoteTM] TMX imported", text, html);
                            } catch (IOException | MessagingException e) {
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

    private JSONArray getProperty(String session, String property)
            throws SQLException, NoSuchAlgorithmException, IOException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            Set<String> set = new TreeSet<>();
            JSONArray memories = manager.getMemories(AuthorizeServlet.getUser(session));
            for (int i = 0; i < memories.length(); i++) {
                JSONObject memory = memories.getJSONObject(i);
                String prop = memory.getString(property);
                if (!prop.isEmpty()) {
                    set.add(prop);
                }
            }
            JSONArray result = new JSONArray();
            Iterator<String> it = set.iterator();
            while (it.hasNext()) {
                result.put(it.next());
            }
            return result;
        }
        throw new IOException(Constants.DENIED);
    }
}