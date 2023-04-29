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

package com.maxprograms.remotetm.utils;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Random;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.RemoteTM;
import com.maxprograms.remotetm.models.EmailServer;
import com.maxprograms.xml.Element;
import com.maxprograms.xml.SAXBuilder;

import org.json.JSONObject;
import org.xml.sax.SAXException;

public class Utils {

    private Utils() {
        // private for security
    }

    private static Random random;
    private static SAXBuilder builder;

    public static void writeResponse(JSONObject json, HttpServletResponse response, int status) throws IOException {
        byte[] bytes = json.toString().getBytes(StandardCharsets.UTF_8);
        response.setContentLength(bytes.length);
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json");
        try (ServletOutputStream output = response.getOutputStream()) {
            output.write(bytes);
        }
    }

    public static JSONObject readJSON(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        String line = "";
        try (InputStreamReader reader = new InputStreamReader(is)) {
            try (BufferedReader buffer = new BufferedReader(reader)) {
                while ((line = buffer.readLine()) != null) {
                    sb.append(line);
                }
            }
        }
        return new JSONObject(sb.toString());
    }

    public static String generatePassword() throws NoSuchAlgorithmException {
        String tokens = "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789#$%!@";
        StringBuilder sb = new StringBuilder();
        if (random == null) {
            random = SecureRandom.getInstanceStrong();
        }
        for (int i = 0; i < 12; i++) {
            sb.append(tokens.charAt(random.nextInt(tokens.length())));
        }
        return sb.toString();
    }

    public static boolean isSafe(HttpServletRequest request, HttpServletResponse response) throws IOException {
        URL url = new URL(request.getRequestURL().toString());
        if (!Constants.HTTPS.equals(url.getProtocol())) {
            denyAccess(response);
            return false;
        }
        return true;
    }

    public static EmailServer getEmailServer() throws IOException {
        JSONObject json;
        File emailServer = new File(RemoteTM.getWorkFolder(), "mailserver.json");
        try (FileInputStream input = new FileInputStream(emailServer)) {
            json = Utils.readJSON(input);
        }
        return new EmailServer(json.getString("server"), json.getString("port"), json.getString("user"),
                json.getString("password"), json.getString("from"), json.getString("instance"),
                json.getBoolean("authenticate"), json.getBoolean("tls"));
    }

    public static void denyAccess(HttpServletResponse response) throws IOException {
        JSONObject json = new JSONObject();
        json.put(Constants.STATUS, Constants.ERROR);
        json.put(Constants.REASON, Constants.DENIED);
        writeResponse(json, response, 401);
    }

    public static void removeDir(File file) throws IOException {
        if (file.isDirectory()) {
            File[] list = file.listFiles();
            for (int i = 0; i < list.length; i++) {
                removeDir(list[i]);
            }
        }
        Files.delete(file.toPath());
    }

    public static Element toElement(String string) throws SAXException, IOException, ParserConfigurationException {
        if (builder == null) {
            builder = new SAXBuilder();
        }
        return builder.build(new ByteArrayInputStream(string.getBytes(StandardCharsets.UTF_8))).getRootElement();
    }
}
