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
import java.net.URL;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.maxprograms.remotetm.Constants;
import com.maxprograms.remotetm.utils.Utils;

import org.json.JSONObject;

public class Logout extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        JSONObject result = new JSONObject();
        response.setContentType("application/json");
        StringBuffer from = request.getRequestURL();
        URL url = new URL(from.toString());
        if (!"https".equals(url.getProtocol())) {
            result.put(Constants.STATUS, Constants.ERROR);
            result.put(Constants.REASON, "https protocol required");
            Utils.writeResponse(result, response, 400);
            return;
        }
        String session = request.getHeader("Session");
        if (AuthorizeServlet.logout(session)) {
            result.put(Constants.STATUS, Constants.OK);
            Utils.writeResponse(result, response, 200);
            return;
        }
        result.put(Constants.STATUS, Constants.ERROR);
        Utils.writeResponse(result, response, 500);
    }
}
