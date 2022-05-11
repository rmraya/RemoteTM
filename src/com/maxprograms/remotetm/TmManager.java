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
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import com.maxprograms.remotetm.utils.Utils;
import com.maxprograms.swordfish.tm.InternalDatabase;

public class TmManager {

    public static final String MEMORIES = "memories";
    static final String CLOSED = "Memory is closed";

    private TmManager() {
        // private for security
    }

    private static Map<String, InternalDatabase> databases;
    private static Map<String, Integer> count;

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

    public static void setOpen(String memory) throws SQLException, IOException {
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

    public static void commit(String memory) throws SQLException, IOException {
        if (!isOpen(memory)) {
            throw new IOException(CLOSED);
        }
        databases.get(memory).commit();
    }
}
