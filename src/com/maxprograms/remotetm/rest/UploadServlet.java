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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.RemoteTM;
import com.maxprograms.remotetm.utils.Utils;

import org.json.JSONObject;

public class UploadServlet extends HttpServlet {

    private static final long serialVersionUID = 3856885250117003115L;

    private static Logger logger = System.getLogger(UploadServlet.class.getName());

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            if (!Utils.isSafe(request, response)) {
                return;
            }
            JSONObject result = new JSONObject();
            String session = request.getHeader("Session");
            if (AuthorizeServlet.sessionActive(session)) {
                try {
                    File homeDir = RemoteTM.getWorkFolder();
                    File tempDir = new File(homeDir, "tmp");
                    if (!tempDir.exists()) {
                        Files.createDirectories(tempDir.toPath());
                    }
                    File temp = File.createTempFile("uploaded", ".tmx", tempDir);
                    try (FileOutputStream out = new FileOutputStream(temp)) {
                        try (ServletInputStream input = request.getInputStream()) {
                            try (BufferedReader reader = new BufferedReader(new InputStreamReader(input))) {
                                String boundary = "";
                                String disposition = "";
                                String contentType = "";
                                String line = "";
                                boolean firstWritten = false;
                                while ((line = reader.readLine()) != null) {
                                    if (boundary.isEmpty()) {
                                        boundary = line;
                                        continue;
                                    }
                                    if (disposition.isEmpty() && line.startsWith("Content-Disposition")) {
                                        disposition = line;
                                        continue;
                                    }
                                    if (contentType.isEmpty() && line.startsWith("Content-Type")) {
                                        contentType = line;
                                        continue;
                                    }
                                    if (line.startsWith(boundary)) {
                                        break;
                                    }
                                    if (firstWritten) {
                                        out.write(("\n").getBytes(StandardCharsets.UTF_8));
                                    }
                                    out.write((line).getBytes(StandardCharsets.UTF_8));
                                    if (!line.isBlank()) {
                                        firstWritten = true;
                                    }
                                }
                            }
                        }
                    }
                    result.put("file", temp.getName());
                    result.put(Constants.STATUS, Constants.OK);
                } catch (Exception e) {
                    result.put(Constants.STATUS, Constants.ERROR);
                    result.put(Constants.REASON, e.getMessage());
                    logger.log(Level.ERROR, "File upload error", e);
                }
                Utils.writeResponse(result, response, 200);
                return;
            }
            result.put(Constants.STATUS, Constants.ERROR);
            result.put(Constants.REASON, Constants.DENIED);
            Utils.writeResponse(result, response, 401);
        } catch (IOException e) {
            logger.log(Level.ERROR, e);
        }
    }

}
