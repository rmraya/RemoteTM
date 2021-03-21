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
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.maxprograms.remotetm.models.User;
import com.maxprograms.remotetm.utils.Crypto;

public class DbManager {

    private static Logger logger = System.getLogger(DbManager.class.getName());
    private Connection conn;

    private static DbManager instance;

    public static DbManager getInstance() throws NoSuchAlgorithmException, IOException, SQLException {
        if (instance == null) {
            instance = new DbManager();
        }
        return instance;
    }

    private DbManager() throws IOException, SQLException, NoSuchAlgorithmException {
        File database = new File(RemoteTM.getWorkFolder(), "h2data");
        boolean needsLoading = !database.exists();
        if (!database.exists()) {
            database.mkdirs();
        }
        DriverManager.registerDriver(new org.h2.Driver());
        String url = "jdbc:h2:" + database.getAbsolutePath() + "/db";
        conn = DriverManager.getConnection(url);
        conn.setAutoCommit(false);
        if (needsLoading) {
            createTables();
        }
    }

    private void createTables() throws SQLException, NoSuchAlgorithmException {
        String users = "CREATE TABLE users (id VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, "
                + "email VARCHAR(200) NOT NULL, role VARCHAR(10) NOT NULL, active CHAR(1) NOT NULL, "
                + "updated CHAR(1) NOT NULL, password VARCHAR(200) NOT NULL,  PRIMARY KEY(id));";
        String permissions = "CREATE TABLE permissions (user VARCHAR(255) NOT NULL, memory VARCHAR(255) NOT NULL, "
                + "canread CHAR(1), canwrite CHAR(1), canexport CHAR(1), PRIMARY KEY(user, memory));";
        String memories = "CREATE TABLE memories (id VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, "
                + "owner VARCHAR(255), project VARCHAR(255), subject VARCHAR(255), client VARCHAR(255), "
                + "creationDate TIMESTAMP, PRIMARY KEY(id));";
        try (Statement create = conn.createStatement()) {
            create.execute(users);
            create.execute(permissions);
            create.execute(memories);
        }
        conn.commit();
        logger.log(Level.INFO, "Users table created");
        User sysadmin = new User("sysadmin", "secData", "System Administrator", "sysadmin@localhost",
                Constants.SYSTEM_ADMINISTRATOR, true, false);
        addUser(sysadmin);
    }

    public void addUser(User user) throws SQLException, NoSuchAlgorithmException {
        String sql = "INSERT INTO users (id, password, name, email, role, active, updated) VALUES(?,?,?,?,?,?,?)";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, user.getId());
            stmt.setString(2, Crypto.sha256(user.getPassword()));
            stmt.setNString(3, user.getName());
            stmt.setString(4, user.getEmail());
            stmt.setString(5, user.getRole());
            stmt.setString(6, user.isActive() ? "Y" : "N");
            stmt.setString(7, user.isUpdated() ? "Y" : "N");
            stmt.execute();
        }
        conn.commit();
    }

    public User getUser(String userId) throws SQLException {
        User result = null;
        String sql = "SELECT name, email, role, active, updated, password FROM users WHERE id=?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String name = rs.getNString(1);
                    String email = rs.getString(2);
                    String role = rs.getString(3);
                    boolean active = rs.getString(4).equals("Y");
                    boolean updated = rs.getString(5).equals("Y");
                    String password = rs.getString(6);
                    result = new User(userId, password, name, email, role, active, updated);
                }
            }
        }
        return result;
    }

    public void removeUser(String id) throws SQLException {
        boolean hasMemories = false;
        String sql = "SELECT id FROM memories WHERE owner=?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    hasMemories = true;
                    break;
                }
            }
        }
        if (hasMemories) {
            throw new SQLException("User owns memories");
        }
        sql = "DELETE FROM permissions WHERE user=?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, id);
            stmt.execute();
        }
        sql = "DELETE FROM users WHERE id=?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, id);
            stmt.execute();
        }
        conn.commit();
    }

    public List<User> getUsers() throws SQLException {
        List<User> result = new ArrayList<>();
        try (Statement stmt = conn.createStatement()) {
            String sql = "SELECT id, name, email, role, active, updated, password FROM users ORDER BY name";
            try (ResultSet rs = stmt.executeQuery(sql)) {
                while (rs.next()) {
                    String id = rs.getString(1);
                    String name = rs.getNString(2);
                    String email = rs.getString(3);
                    String role = rs.getString(4);
                    boolean active = rs.getString(5).equals("Y");
                    boolean updated = rs.getString(6).equals("Y");
                    String password = rs.getString(7);
                    result.add(new User(id, password, name, email, role, active, updated));
                }
            }
        }
        return result;
    }

    public void updateUser(User user) throws SQLException {
        String sql = "UPDATE users SET name=?, email=?, role=?, active=?, updated=? WHERE id=?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setNString(1, user.getName());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getRole());
            stmt.setString(4, user.isActive() ? "Y" : "N");
            stmt.setString(5, user.isUpdated() ? "Y" : "N");
            stmt.setString(6, user.getId());
            stmt.execute();
        }
        conn.commit();
    }

    public void commit() throws SQLException {
        conn.commit();
    }

    public void rollback() throws SQLException {
        conn.rollback();
    }
}
