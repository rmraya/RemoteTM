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
package com.maxprograms.remotetm.utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Random;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.RemoteTM;
import com.maxprograms.remotetm.models.EmailServer;

import org.json.JSONObject;

public class Utils {

    private Utils() {
        // private for security
    }

    private static Random random;

    public static void writeResponse(JSONObject json, HttpServletResponse response, int status) throws IOException {
        byte[] bytes = json.toString().getBytes(StandardCharsets.UTF_8);
        response.setContentLength(bytes.length);
        response.setStatus(status);
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
}
