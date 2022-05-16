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

package com.maxprograms.remotetm;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.sql.SQLException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.xml.parsers.ParserConfigurationException;

import com.maxprograms.remotetm.utils.Utils;
import com.maxprograms.swordfish.tm.InternalDatabase;
import com.maxprograms.swordfish.tm.Match;
import com.maxprograms.xml.Element;

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
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        InternalDatabase db = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        int imported = db.storeTMX(tmx, project, client, subject);
        db.close();
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
            databases = new ConcurrentHashMap<>();
            count = new ConcurrentHashMap<>();
        }
        return databases.containsKey(memory);
    }

    public static void removeMemory(String memory) throws SQLException, IOException {
        if (databases == null) {
            databases = new ConcurrentHashMap<>();
            count = new ConcurrentHashMap<>();
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

    public static void close(String memory) throws SQLException, IOException {
        if (!isOpen(memory)) {
            throw new IOException(CLOSED);
        }
        if (databases.containsKey(memory)) {
            int users = count.get(memory);
            if (users == 1) {
                InternalDatabase engine = databases.get(memory);
                engine.close();
                databases.remove(memory);
                count.remove(memory);
                return;
            }
            count.put(memory, users - 1);
        }
    }

    public static String exportMemory(String memory, String name, Set<String> languages, String srcLang)
            throws SQLException, IOException {
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        InternalDatabase db = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        File tempFolder = new File(RemoteTM.getWorkFolder(), "tmp");
        File tmx = new File(tempFolder, name + ".tmx");
        if (tmx.exists()) {
            Files.delete(tmx.toPath());
        }
        db.exportMemory(tmx.getAbsolutePath(), languages, srcLang);
        db.close();
        return tmx.getName();
    }

    public static void openMemory(String memory) throws SQLException, IOException {
        if (databases == null) {
            databases = new ConcurrentHashMap<>();
            count = new ConcurrentHashMap<>();
        }
        if (!databases.containsKey(memory)) {
            File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
            databases.put(memory, new InternalDatabase(memory, memoriesFolder.getAbsolutePath()));
            count.put(memory, 0);
        }
        count.put(memory, count.get(memory) + 1);
    }

    public static void closeMemories() throws SQLException, IOException {
        if (databases == null) {
            databases = new ConcurrentHashMap<>();
            count = new ConcurrentHashMap<>();
        }
        Set<String> keys = databases.keySet();
        Iterator<String> it = keys.iterator();
        while (it.hasNext()) {
            close(it.next());
        }
    }

    public static Set<String> getAllClients(String memory) throws IOException, SQLException {
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        InternalDatabase db = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        Set<String> result = db.getAllClients();
        db.close();
        return result;
    }

    public static Set<String> getAllLanguages(String memory) throws SQLException, IOException {
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        InternalDatabase db = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        Set<String> result = db.getAllLanguages();
        db.close();
        return result;
    }

    public static Set<String> getAllProjects(String memory) throws IOException, SQLException {
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        InternalDatabase db = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        Set<String> result = db.getAllProjects();
        db.close();
        return result;
    }

    public static Set<String> getAllSubjects(String memory) throws IOException, SQLException {
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        InternalDatabase db = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        Set<String> result = db.getAllSubjects();
        db.close();
        return result;
    }

    public static void storeTu(String memory, Element tu) throws SQLException, IOException {
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        InternalDatabase db = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        db.storeTu(tu);
        db.close();
    }

    public static Element getTu(String memory, String tuid)
            throws IOException, SQLException, SAXException, ParserConfigurationException {
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        InternalDatabase db = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        Element result = db.getTu(tuid);
        db.close();
        return result;
    }

    public static void removeTu(String memory, String tuid) throws IOException, SQLException {
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        InternalDatabase db = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        db.removeTu(tuid);
        db.close();
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
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        InternalDatabase db = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        List<Match> result = db.searchTranslation(searchStr, srcLang, tgtLang, similarity, caseSensitive);
        db.close();
        return result;
    }

    public static List<Element> searchAll(String memory, String searchStr, String srcLang, int similarity,
            boolean caseSensitive) throws IOException, SAXException, ParserConfigurationException, SQLException {
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        InternalDatabase db = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        List<Element> result = db.searchAll(searchStr, srcLang, similarity, caseSensitive);
        db.close();
        return result;
    }

    public static List<Element> concordanceSearch(String memory, String searchStr, String srcLang, int limit,
            boolean isRegexp, boolean caseSensitive)
            throws SQLException, SAXException, IOException, ParserConfigurationException {
        File memoriesFolder = new File(RemoteTM.getWorkFolder(), MEMORIES);
        InternalDatabase db = new InternalDatabase(memory, memoriesFolder.getAbsolutePath());
        List<Element> result = db.concordanceSearch(searchStr, srcLang, limit, isRegexp, caseSensitive);
        db.close();
        return result;
    }
}
