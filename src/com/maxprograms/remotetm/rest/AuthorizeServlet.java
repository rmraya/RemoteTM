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

import java.io.IOException;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.DbManager;
import com.maxprograms.remotetm.models.User;
import com.maxprograms.remotetm.utils.Crypto;

import org.json.JSONObject;

public class AuthorizeServlet extends HttpServlet {

    private static final long serialVersionUID = -6334636523094070576L;

    private static Logger logger = System.getLogger(AuthorizeServlet.class.getName());
    private static Map<String, String> tickets;
    private static DbManager dbManager;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            response.setContentType("application/json");
            StringBuffer from = request.getRequestURL();

            if (!from.toString().toLowerCase().startsWith("https://")) {
                response.setStatus(401);
                JSONObject result = new JSONObject();
                result.put(Constants.STATUS, Constants.ERROR);
                result.put(Constants.REASON, "https protocol required");
                String res = result.toString();
                byte[] bytes = res.getBytes(StandardCharsets.UTF_8);
                response.setContentLength(bytes.length);
                try (ServletOutputStream output = response.getOutputStream()) {
                    output.write(bytes);
                }
                return;
            }
            if (tickets == null) {
                tickets = new ConcurrentHashMap<>();
            }

            String header = request.getHeader("Authorization");
            if (header != null && !header.isEmpty()) {
                String encoded = header.substring("BASIC ".length()).trim();
                byte[] bytes = Base64.getDecoder().decode(encoded);
                String decoded = new String(bytes);

                String userId = decoded.substring(0, decoded.indexOf(':'));
                String pass = decoded.substring(decoded.indexOf(':') + 1);
                String session = UUID.randomUUID().toString();

                if (dbManager == null) {
                    dbManager = new DbManager();
                }

                User user = dbManager.getUser(userId);
                if (user != null) {
                    if (user.isActive() && Crypto.sha256(pass).equals(user.getPassword())) {
                        response.setStatus(200);
                        JSONObject result = new JSONObject();
                        result.put(Constants.STATUS, Constants.OK);
                        result.put(Constants.TICKET, session);
                        String res = result.toString();
                        bytes = res.getBytes(StandardCharsets.UTF_8);
                        response.setContentLength(bytes.length);
                        try (ServletOutputStream output = response.getOutputStream()) {
                            output.write(bytes);
                        }
                        return;
                    }
                }
            }
            response.setStatus(401);
            JSONObject result = new JSONObject();
            result.put(Constants.STATUS, Constants.ERROR);
            result.put(Constants.REASON, "Access denied");
            String res = result.toString();
            byte[] bytes = res.getBytes(StandardCharsets.UTF_8);
            response.setContentLength(bytes.length);
            try (ServletOutputStream output = response.getOutputStream()) {
                output.write(bytes);
            }
        } catch (IOException | SQLException | NoSuchAlgorithmException e) {
            logger.log(Level.ERROR, e);
        }
    }
}
