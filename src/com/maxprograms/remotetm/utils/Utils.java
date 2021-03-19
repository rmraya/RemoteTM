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
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

public class Utils {

    private Utils() {
        // private for security
    }

    public static void writeResponse(JSONObject result, HttpServletResponse response, int status) throws IOException {
        byte[] bytes = result.toString().getBytes(StandardCharsets.UTF_8);
        response.setContentLength(bytes.length);
        response.setStatus(status);
        try (ServletOutputStream output = response.getOutputStream()) {
            output.write(bytes);
        }
    }

    public static JSONObject readBody(InputStream is) throws IOException {
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

    public static String generatePassword() {
        String tokens = "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789#$%!@";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            sb.append(tokens.charAt((int) (Math.random() * tokens.length())));
        }
        return sb.toString();
    }
}
