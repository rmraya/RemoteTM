package com.maxprograms.remotetm.rest;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.nio.charset.StandardCharsets;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.RemoteTM;
import com.maxprograms.remotetm.utils.Utils;

import org.json.JSONObject;

public class EmailServerServlet extends HttpServlet {

    private static final long serialVersionUID = -735904418329940685L;

    private static Logger logger = System.getLogger(EmailServerServlet.class.getName());

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            if (!Utils.isSafe(request, response)) {
                return;
            }
            JSONObject result = new JSONObject();
            String session = request.getHeader("Session");
            if (AuthorizeServlet.sessionActive(session)) {
                File emailServer = new File(RemoteTM.getWorkFolder(), "mailserver.json");
                if (!emailServer.exists()) {
                    JSONObject json = new JSONObject();
                    json.put("server", "");
                    json.put("port", 465);
                    json.put("user", "");
                    json.put("password", "");
                    json.put("from", "");
                    json.put("instance", "");
                    json.put("authenticate", false);
                    json.put("tls", false);
                    try (FileOutputStream out = new FileOutputStream(emailServer)) {
                        out.write(json.toString(2).getBytes(StandardCharsets.UTF_8));
                    }
                }
                try (FileInputStream input = new FileInputStream(emailServer)) {
                    result = Utils.readJSON(input);
                }
                result.put(Constants.STATUS, Constants.OK);
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

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        try {
            if (!Utils.isSafe(request, response)) {
                return;
            }
            JSONObject result = new JSONObject();
            String session = request.getHeader("Session");
            if (AuthorizeServlet.sessionActive(session)) {
                JSONObject json = Utils.readJSON(request.getInputStream());
                File emailServer = new File(RemoteTM.getWorkFolder(), "mailserver.json");
                try (FileOutputStream out = new FileOutputStream(emailServer)) {
                    out.write(json.toString(2).getBytes(StandardCharsets.UTF_8));
                }
                result.put(Constants.STATUS, Constants.OK);
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
