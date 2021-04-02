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
package com.maxprograms.remotetm;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.sql.SQLException;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.xml.parsers.ParserConfigurationException;

import com.maxprograms.remotetm.utils.Utils;
import com.maxprograms.swordfish.tm.InternalDatabase;

import org.xml.sax.SAXException;

public class TmManager {

    static final String MEMORIES = "memories";

    private TmManager() {
        // private for security
    }

    private static Map<String, InternalDatabase> databases;
    private static Map<String, Integer> count;

    public static int storeTMX(String memory, String tmx, String project, String client, String subject)
            throws IOException, SQLException, SAXException, ParserConfigurationException {
        if (databases == null) {
            databases = new ConcurrentHashMap<>();
            count = new ConcurrentHashMap<>();
        }
        openMemory(memory);
        int imported = databases.get(memory).storeTMX(tmx, project, client, subject);
        closeMemory(memory);
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

    public static void closeMemory(String memory) throws SQLException {
        if (databases == null) {
            databases = new ConcurrentHashMap<>();
            count = new ConcurrentHashMap<>();
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

    public static String exportMemory(String memory, String name) throws SQLException, IOException {
        openMemory(memory);
        InternalDatabase engine = databases.get(memory);
        File tempFolder = new File(RemoteTM.getWorkFolder(), "tmp");
        File tmx = new File(tempFolder, name + ".tmx");
        if (tmx.exists()) {
            Files.delete(tmx.toPath());
        }
        engine.exportMemory(tmx.getAbsolutePath(), engine.getAllLanguages(), "*all*");
        closeMemory(memory);
        return tmx.getName();
    }

    private static void openMemory(String memory) throws SQLException, IOException {
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

    public static void closeMemories() throws SQLException {
        if (databases == null) {
            databases = new ConcurrentHashMap<>();
            count = new ConcurrentHashMap<>();
        }
        Set<String> keys = databases.keySet();
        Iterator<String> it = keys.iterator();
        while (it.hasNext()) {
            closeMemory(it.next());
        }
    }
}
