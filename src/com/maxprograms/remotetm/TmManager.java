/*******************************************************************************
 * Copyright (c) 2008-2023 Maxprograms.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 1.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/org/documents/epl-v10.html
 *
 * Contributors:
 *     Maxprograms - initial API and implementation
 *******************************************************************************/

package com.maxprograms.remotetm;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.sql.SQLException;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.xml.parsers.ParserConfigurationException;

import com.maxprograms.remotetm.utils.Utils;
import com.maxprograms.swordfish.tm.InternalDatabase;
import com.maxprograms.swordfish.tm.Match;
import com.maxprograms.xml.Element;

import org.json.JSONArray;
import org.json.JSONObject;
import org.xml.sax.SAXException;

public class TmManager {

    static final String MEMORIES = "memories";
    static final String CLOSED = "Memory is closed";

    private TmManager() {
        // private for security
    }

    private static Map<String, InternalDatabase> databases;
    private static Map<String, Integer> count;

    public static int storeTMX(String memory, String tmx, String project, String client, String subject)
            throws IOException, SQLException, SAXException, ParserConfigurationException {
        InternalDatabase db = openMemory(memory);
        int imported = db.storeTMX(tmx, project, client, subject);
        close(memory);
        Files.deleteIfExists(new File(tmx).toPath());
        return imported;
    }

    public static void createMemory(String memory) throws SQLException, IOException {
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        if (!memoriesFolder.exists()) {
            Files.createDirectories(memoriesFolder.toPath());
        }
        InternalDatabase engine = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        engine.close();
    }

    public static boolean isOpen(String memory) {
        if (databases == null) {
            databases = new Hashtable<>();
            count = new Hashtable<>();
        }
        return databases.containsKey(memory);
    }

    public static void removeMemory(String memory) throws SQLException, IOException {
        if (databases == null) {
            databases = new Hashtable<>();
            count = new Hashtable<>();
        }
        if (databases.containsKey(memory)) {
            InternalDatabase engine = databases.get(memory);
            engine.close();
            databases.remove(memory);
            count.remove(memory);
        }
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        Utils.removeDir(new File(memoriesFolder, memory));
    }

    public static synchronized void close(String memory) throws SQLException {
        if (databases.containsKey(memory)) {
            int useCount = count.get(memory);
            if (useCount == 1) {
                InternalDatabase engine = databases.get(memory);
                engine.close();
                databases.remove(memory);
                count.remove(memory);
                return;
            }
            count.put(memory, useCount - 1);
        }
    }

    public static String exportMemory(String memory, String name, Set<String> languages, String srcLang)
            throws SQLException, IOException {
        InternalDatabase db = openMemory(memory);
        File tempFolder = new File(RemoteTM.getWorkFolder(), "tmp");
        File tmx = new File(tempFolder, name + ".tmx");
        if (tmx.exists()) {
            Files.delete(tmx.toPath());
        }
        db.exportMemory(tmx.getAbsolutePath(), languages, srcLang);
        close(memory);
        return tmx.getName();
    }

    public static synchronized InternalDatabase openMemory(String memory) throws SQLException, IOException {
        if (databases == null) {
            databases = new Hashtable<>();
            count = new Hashtable<>();
        }
        if (!databases.containsKey(memory)) {
            File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
            databases.put(memory, new InternalDatabase(memory, memoriesFolder.getAbsolutePath()));
            count.put(memory, 0);
        }
        count.put(memory, count.get(memory) + 1);
        return databases.get(memory);
    }

    public static void closeMemories() throws SQLException {
        if (databases == null) {
            databases = new Hashtable<>();
            count = new Hashtable<>();
        }
        Set<String> keys = databases.keySet();
        Iterator<String> it = keys.iterator();
        while (it.hasNext()) {
            InternalDatabase db = databases.get(it.next());
            db.close();
        }
        databases.clear();
        count.clear();
    }

    public static Set<String> getAllClients(String memory) throws IOException, SQLException {
        InternalDatabase db = openMemory(memory);
        Set<String> result = db.getAllClients();
        close(memory);
        return result;
    }

    public static Set<String> getAllLanguages(String memory) throws SQLException, IOException {
        InternalDatabase db = openMemory(memory);
        Set<String> result = db.getAllLanguages();
        close(memory);
        return result;
    }

    public static Set<String> getAllProjects(String memory) throws IOException, SQLException {
        InternalDatabase db = openMemory(memory);
        Set<String> result = db.getAllProjects();
        close(memory);
        return result;
    }

    public static Set<String> getAllSubjects(String memory) throws IOException, SQLException {
        InternalDatabase db = openMemory(memory);
        Set<String> result = db.getAllSubjects();
        close(memory);
        return result;
    }

    public static void storeTu(String memory, Element tu) throws SQLException, IOException {
        InternalDatabase db = openMemory(memory);
        db.storeTu(tu);
        close(memory);
    }

    public static Element getTu(String memory, String tuid)
            throws IOException, SQLException, SAXException, ParserConfigurationException {
        InternalDatabase db = openMemory(memory);
        Element result = db.getTu(tuid);
        close(memory);
        return result;
    }

    public static void removeTu(String memory, String tuid)
            throws IOException, SQLException, SAXException, ParserConfigurationException {
        InternalDatabase db = openMemory(memory);
        db.removeTu(tuid);
        close(memory);
    }

    public static void commit(String memory) throws SQLException, IOException {
        if (!isOpen(memory)) {
            throw new IOException(CLOSED);
        }
        databases.get(memory).commit();
    }

    public static List<Match> searchTranslation(String memory, String searchStr, String srcLang, String tgtLang,
            int similarity, boolean caseSensitive)
            throws IOException, SAXException, ParserConfigurationException, SQLException {
        InternalDatabase db = openMemory(memory);
        List<Match> result = db.searchTranslation(searchStr, srcLang, tgtLang, similarity, caseSensitive);
        close(memory);
        return result;
    }

    public static List<Element> searchAll(String memory, String searchStr, String srcLang, int similarity,
            boolean caseSensitive) throws IOException, SAXException, ParserConfigurationException, SQLException {
        InternalDatabase db = openMemory(memory);
        List<Element> result = db.searchAll(searchStr, srcLang, similarity, caseSensitive);
        close(memory);
        return result;
    }

    public static List<Element> concordanceSearch(String memory, String searchStr, String srcLang, int limit,
            boolean isRegexp, boolean caseSensitive)
            throws SQLException, SAXException, IOException, ParserConfigurationException {
        InternalDatabase db = openMemory(memory);
        List<Element> result = db.concordanceSearch(searchStr, srcLang, limit, isRegexp, caseSensitive);
        close(memory);
        return result;
    }

    public static JSONArray batchTranslate(String memory, JSONObject params)
            throws IOException, SAXException, ParserConfigurationException, SQLException {
        InternalDatabase db = openMemory(memory);
        JSONArray result = db.batchTranslate(params);
        close(memory);
        return result;
    }

}
