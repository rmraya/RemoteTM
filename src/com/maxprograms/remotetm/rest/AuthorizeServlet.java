/*******************************************************************************
 * Copyright (c) 2008-2024 Maxprograms.
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

import java.io.IOException;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.net.URISyntaxException;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.DbManager;
import com.maxprograms.remotetm.models.Ticket;
import com.maxprograms.remotetm.models.User;
import com.maxprograms.remotetm.utils.Crypto;
import com.maxprograms.remotetm.utils.Utils;

import org.json.JSONObject;

public class AuthorizeServlet extends HttpServlet {

    private static final long serialVersionUID = -6334636523094070576L;

    private static Logger logger = System.getLogger(AuthorizeServlet.class.getName());
    private static Map<String, Ticket> tickets;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            if (!Utils.isSafe(request, response)) {
                return;
            }
            response.setContentType("application/json");
            JSONObject result = new JSONObject();
            String header = request.getHeader("Authorization");
            if (header != null && !header.isEmpty()) {
                String encoded = header.substring("BASIC ".length()).trim();
                byte[] bytes = Base64.getDecoder().decode(encoded);
                String decoded = new String(bytes);

                String userId = decoded.substring(0, decoded.indexOf(':'));
                String pass = decoded.substring(decoded.indexOf(':') + 1);

                DbManager dbManager = DbManager.getInstance();
                User user = dbManager.getUser(userId);
                if (user != null && user.isActive() && Crypto.sha256(pass).equals(user.getPassword())) {
                    String session = UUID.randomUUID().toString();
                    result.put(Constants.STATUS, Constants.OK);
                    result.put(Constants.TICKET, session);
                    result.put("role", user.getRole());
                    if (tickets == null) {
                        tickets = new ConcurrentHashMap<>();
                    }
                    tickets.put(session, new Ticket(userId));
                    Utils.writeResponse(result, response, 200);
                    return;
                }
            }
            Utils.denyAccess(response);
        } catch (IOException | SQLException | NoSuchAlgorithmException | URISyntaxException e) {
            logger.log(Level.ERROR, e);
        }
    }

    public static boolean logout(String session) {
        if (tickets != null && session != null && tickets.containsKey(session)) {
            tickets.remove(session);
            return true;
        }
        return false;
    }

    public static boolean sessionActive(String session) {
        if (tickets != null && session != null && tickets.containsKey(session)) {
            tickets.get(session).setLastAccess(System.currentTimeMillis());
            return true;
        }
        return false;
    }

    public static String getUser(String session) {
        if (tickets != null && session != null && tickets.containsKey(session)) {
            return tickets.get(session).getUser();
        }
        return null;
    }
}
