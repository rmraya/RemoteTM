/*******************************************************************************
 * Copyright (c) 2008-2021 Maxprograms.
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

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.nio.file.Files;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.RemoteTM;
import com.maxprograms.remotetm.utils.Utils;

public class DownloadServlet extends HttpServlet {

    private static final long serialVersionUID = -3142235158770712461L;
    private static Logger logger = System.getLogger(DownloadServlet.class.getName());

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            if (!Utils.isSafe(request, response)) {
                return;
            }
            String session = request.getParameter("session");
            String file = request.getParameter("file");
            if (AuthorizeServlet.sessionActive(session)) {
                File tempFolder = new File(RemoteTM.getWorkFolder(), "tmp");
                File tmx = new File(tempFolder, file);
                if (tmx.exists()) {
                    response.addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                    response.addHeader("Pragma", "no-cache");
                    response.addHeader("Expires", "-1");
                    try (ServletOutputStream op = response.getOutputStream()) {
                        response.setContentType("text/xml;charset=utf-8");
                        response.setStatus(200);
                        response.setContentLength((int) tmx.length());
                        response.setHeader("Content-Disposition", "attachment; filename=\"" + tmx.getName() + "\"");
                        byte[] bbuf = new byte[2048];
                        int length = 0;
                        try (DataInputStream in = new DataInputStream(new FileInputStream(tmx))) {
                            while ((length = in.read(bbuf)) != -1) {
                                op.write(bbuf, 0, length);
                            }
                        }
                        op.flush();
                    }
                    Files.delete(tmx.toPath());
                }
            }
            Utils.denyAccess(response);
        } catch (IOException e) {
            logger.log(Level.ERROR, e);
        }
    }
}
