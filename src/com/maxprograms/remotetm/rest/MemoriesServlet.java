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

import java.io.File;
import java.io.IOException;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.nio.file.Files;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.Iterator;
import java.util.List;
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
import com.maxprograms.swordfish.tm.InternalDatabase;
import com.maxprograms.swordfish.tm.Match;
import com.maxprograms.xml.Element;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.xml.sax.SAXException;

public class MemoriesServlet extends HttpServlet {

    private static final long serialVersionUID = 6894498215572036825L;
    private static Logger logger = System.getLogger(MemoriesServlet.class.getName());
    private static final String MEMORY = "memory";

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
                        case "closeMemories":
                            TmManager.closeMemories();
                            break;
                        case "openMemory":
                            openMemory(session, body);
                            break;
                        case "closeMemory":
                            closeMemory(session, body);
                            break;
                        case "memoryClients":
                            result.put("clients", memoryClients(session, body));
                            break;
                        case "memoryLanguages":
                            result.put("languages", memoryLanguages(session, body));
                            break;
                        case "memoryProjects":
                            result.put("projects", memoryProjects(session, body));
                            break;
                        case "memorySubjects":
                            result.put("subjects", memorySubjects(session, body));
                            break;
                        case "storeTu":
                            storeTu(session, body);
                            break;
                        case "getTu":
                            result.put("tu", getTu(session, body).toString());
                            break;
                        case "removeTu":
                            removeTu(session, body);
                            break;
                        case "commit":
                            commit(session, body);
                            break;
                        case "searchTranslation":
                            result.put("matches", searchTranslation(session, body));
                            break;
                        case "searchAll":
                            result.put("tus", searchAll(session, body));
                            break;
                        case "concordanceSearch":
                            result.put("tus", concordanceSearch(session, body));
                            break;
                        case "batchTranslate":
                            result.put("matches", batchTranslate(session, body));
                            break;
                        default:
                            Utils.denyAccess(response);
                            return;
                    }
                    result.put(Constants.STATUS, Constants.OK);
                    Utils.writeResponse(result, response, 200);
                } catch (SQLException | NoSuchAlgorithmException | JSONException | IOException | SAXException
                        | ParserConfigurationException e) {
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
        String memory = params.getString(MEMORY);
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        String owner = manager.getOwner(memory);
        if (who != null && who.isActive()) {
            Memory mem = manager.getMemory(memory);
            if (Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole()) || who.getId().equals(owner)) {
                File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
                InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
                Set<String> languages = null;
                if (params.has("languages")) {
                    languages = new TreeSet<>();
                    JSONArray langs = params.getJSONArray("languages");
                    for (int i = 0; i < langs.length(); i++) {
                        languages.add(langs.getString(i));
                    }
                } else {
                    languages = engine.getAllLanguages();
                }
                File tempFolder = new File(RemoteTM.getWorkFolder(), "tmp");
                File tmx = new File(tempFolder, mem.getName() + ".tmx");
                if (tmx.exists()) {
                    Files.delete(tmx.toPath());
                }
                engine.exportMemory(tmx.getAbsolutePath(), languages, params.getString("srcLang"));
                if (params.has("close") && params.getBoolean("close")) {
                    engine.close();
                }
                return tmx.getName();
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private void openMemory(String session, JSONObject params)
            throws SQLException, NoSuchAlgorithmException, IOException {
        String memory = params.getString(MEMORY);
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canRead() || p.canWrite() || p.canExport()) {
                TmManager.setOpen(memory);
                return;
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private void closeMemory(String session, JSONObject params)
            throws SQLException, NoSuchAlgorithmException, IOException {
        String memory = params.getString(MEMORY);
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canRead() || p.canWrite() || p.canExport()) {
                TmManager.close(memory);
                return;
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private void removeMemory(String session, JSONObject params)
            throws SQLException, NoSuchAlgorithmException, IOException {
        String memory = params.getString(MEMORY);
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            String owner = manager.getOwner(memory);
            if (owner.isEmpty()) {
                throw new IOException("Invalid memory");
            }
            if (Constants.SYSTEM_ADMINISTRATOR.equals(who.getRole()) || who.getId().equals(owner)) {
                TmManager.removeMemory(memory);
                manager.removeMemory(memory);
                return;
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private JSONArray memoryClients(String session, JSONObject params)
            throws NoSuchAlgorithmException, IOException, SQLException {
        String memory = params.getString(MEMORY);
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
            InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
            JSONArray array = new JSONArray();
            Set<String> set = engine.getAllClients();
            engine.close();
            Iterator<String> it = set.iterator();
            while (it.hasNext()) {
                array.put(it.next());
            }
            return array;
        }
        throw new IOException(Constants.DENIED);
    }

    private JSONArray memoryLanguages(String session, JSONObject params)
            throws NoSuchAlgorithmException, IOException, SQLException {
        String memory = params.getString(MEMORY);
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
            InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
            JSONArray array = new JSONArray();
            Set<String> set = engine.getAllLanguages();
            engine.close();
            Iterator<String> it = set.iterator();
            while (it.hasNext()) {
                array.put(it.next());
            }
            return array;
        }
        throw new IOException(Constants.DENIED);
    }

    private Element getTu(String session, JSONObject params)
            throws IOException, NoSuchAlgorithmException, SQLException, SAXException, ParserConfigurationException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            String memory = params.getString(MEMORY);
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canRead()) {
                File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
                InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
                Element tu = engine.getTu(params.getString("tuid"));
                engine.close();
                if (tu != null) {
                    return tu;
                }
                throw new IOException("TU does not exist");
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private JSONArray memoryProjects(String session, JSONObject params)
            throws NoSuchAlgorithmException, IOException, SQLException {
        String memory = params.getString(MEMORY);
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
            InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
            JSONArray array = new JSONArray();
            Set<String> set = engine.getAllProjects();
            engine.close();
            Iterator<String> it = set.iterator();
            while (it.hasNext()) {
                array.put(it.next());
            }
            return array;
        }
        throw new IOException(Constants.DENIED);
    }

    private JSONArray memorySubjects(String session, JSONObject params)
            throws NoSuchAlgorithmException, IOException, SQLException {
        String memory = params.getString(MEMORY);
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
            InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
            JSONArray array = new JSONArray();
            Set<String> set = engine.getAllSubjects();
            engine.close();
            Iterator<String> it = set.iterator();
            while (it.hasNext()) {
                array.put(it.next());
            }
            return array;
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

    private void storeTu(String session, JSONObject params)
            throws NoSuchAlgorithmException, IOException, SQLException, SAXException, ParserConfigurationException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            String memory = params.getString(MEMORY);
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canWrite()) {
                Element tu = Utils.toElement(params.getString("tu"));
                File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
                InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
                engine.storeTu(tu);
                engine.close();
                return;
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private void removeTu(String session, JSONObject params)
            throws NoSuchAlgorithmException, IOException, SQLException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            String memory = params.getString(MEMORY);
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canWrite()) {
                File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
                InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
                engine.removeTu(params.getString("tuid"));
                engine.close();
                return;
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private JSONArray searchTranslation(String session, JSONObject params)
            throws IOException, SAXException, ParserConfigurationException, SQLException, NoSuchAlgorithmException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            String memory = params.getString(MEMORY);
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canRead()) {
                File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
                InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
                List<Match> matches = engine.searchTranslation(params.getString("searchStr"),
                        params.getString("srcLang"), params.getString("tgtLang"), params.getInt("similarity"),
                        params.getBoolean("caseSensitive"));
                engine.close();
                JSONArray array = new JSONArray();
                for (int i = 0; i < matches.size(); i++) {
                    array.put(matches.get(i).toJSON());
                }
                return array;
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private JSONArray searchAll(String session, JSONObject params)
            throws IOException, SAXException, ParserConfigurationException, SQLException, NoSuchAlgorithmException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            String memory = params.getString(MEMORY);
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canRead()) {
                File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
                InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
                List<Element> matches = engine.searchAll(params.getString("searchStr"),
                        params.getString("srcLang"), params.getInt("similarity"), params.getBoolean("caseSensitive"));
                engine.close();
                JSONArray array = new JSONArray();
                for (int i = 0; i < matches.size(); i++) {
                    array.put(matches.get(i).toString());
                }
                return array;
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private JSONArray concordanceSearch(String session, JSONObject params)
            throws IOException, SAXException, ParserConfigurationException, SQLException, NoSuchAlgorithmException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            String memory = params.getString(MEMORY);
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canRead()) {
                File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
                InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
                List<Element> matches = engine.concordanceSearch(params.getString("searchStr"),
                        params.getString("srcLang"), params.getInt("limit"), params.getBoolean("isRegexp"),
                        params.getBoolean("caseSensitive"));
                engine.close();
                JSONArray array = new JSONArray();
                for (int i = 0; i < matches.size(); i++) {
                    array.put(matches.get(i).toString());
                }
                return array;
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private void commit(String session, JSONObject params) throws NoSuchAlgorithmException, IOException, SQLException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            String memory = params.getString(MEMORY);
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canWrite()) {
                TmManager.commit(memory);
                return;
            }
        }
        throw new IOException(Constants.DENIED);
    }

    private void importTMX(String session, final JSONObject params)
            throws SQLException, NoSuchAlgorithmException, IOException {
        DbManager manager = DbManager.getInstance();
        final User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            final String memory = params.getString(MEMORY);
            final Memory mem = manager.getMemory(memory);
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canWrite()) {
                Thread thread = new Thread() {
                    @Override
                    public void run() {
                        try {
                            File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
                            InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
                            File tempDir = new File(RemoteTM.getWorkFolder(), "tmp");
                            File tmx = new File(tempDir, params.getString("file"));
                            int imported = engine.storeTMX(tmx.getAbsolutePath(),
                                    params.getString("project"), params.getString("client"),
                                    params.getString("subject"));
                            engine.close();
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
                            if (params.has("close") && params.getBoolean("close")) {
                                TmManager.close(memory);
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

    private JSONArray batchTranslate(String session, JSONObject params)
            throws NoSuchAlgorithmException, IOException, SQLException, SAXException, ParserConfigurationException {
        DbManager manager = DbManager.getInstance();
        User who = manager.getUser(AuthorizeServlet.getUser(session));
        if (who != null && who.isActive()) {
            String memory = params.getString(MEMORY);
            Permission p = manager.getPermission(memory, who.getId());
            if (p.canRead()) {
                JSONArray result = new JSONArray();
                String srcLang = params.getString("srcLang");
                String tgtLang = params.getString("tgtLang");
                JSONArray segments = params.getJSONArray("segments");
                File memoriesFolder = new File(RemoteTM.getWorkFolder(), TmManager.MEMORIES);
                InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
                for (int i = 0; i < segments.length(); i++) {
                    JSONObject json = segments.getJSONObject(i);
                    List<Match> matches = engine.searchTranslation(json.getString("pure"), srcLang, tgtLang,
                            60, false);
                    JSONArray array = new JSONArray();
                    for (int j = 0; j < matches.size(); j++) {
                        array.put(matches.get(j).toJSON());
                    }
                    json.put("matches", array);
                    result.put(json);
                }
                engine.close();
                return result;
            }
        }
        throw new IOException(Constants.DENIED);
    }
}