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

 package com.maxprograms.remotetm.utils;

import java.util.Date;
import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

import com.maxprograms.remotetm.models.EmailServer;

public class SendMail {

    private EmailServer server;

    private static final String HEADER = "<table width='100%' style='border-collapse:collapse; margin-bottom:30px;'><tr><td style='background:#0073B5;color:white; text-align:left; font-family: sans-serif; font-size:2em; letter-spacing: 2px; font-weight: lighter; padding-left:20px; padding-top:10px; padding-bottom:10px; text-shadow: 2px 2px 7px #444444;'>RemoteTM</td></tr></table>";
    private static final String FOOTER = "<table width='100%' style='border-collapse:collapse; margin-top:40px;'><tr><td style='background:#0073B5;color:#dddddd; text-align:center; font-family:sans-serif; font-size:0.8em; padding:20px;'>Copyright &copy; 2008 - 2021 <a style='color:#eeeeee; text-decoration:none' href='https://www.maxprograms.com/'>Maxprograms</a>. All rights reserved.</td></tr></table>";

    public SendMail(EmailServer server) {
        this.server = server;
    }

    public synchronized void sendMail(String[] to, String[] cc, String[] bcc, String subject, String text, String html)
            throws MessagingException {

        if (subject == null) {
            subject = "(no subject)";
        }

        Properties props = new Properties();
        Session session;

        props.put("mail.from", server.getFrom());
        props.put("mail.smtp.host", server.getServer());
        props.put("mail.smtp.port", server.getPort());
        props.put("mail.transport.protocol", "smtp");

        if (server.isUseTLS()) {
            props.put("mail.smtp.socketFactory.port", server.getPort());
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
            props.put("mail.smtp.ssl.checkserveridentity", "true");
            props.put("mail.smtp.socketFactory.fallback", "false");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.ssl", "true");
        }

        if (server.isAuthRequired()) {
            Authenticator authenticator = new MyAuthenticator(server.getUser(), server.getPasswd());
            props.put("mail.user", server.getUser());
            props.put("mail.smtp.auth", "true");
            session = Session.getInstance(props, authenticator);
        } else {
            session = Session.getInstance(props);
        }
        session.setDebug(false);

        MimeMessage msg = new MimeMessage(session);
        Multipart multiPart = new MimeMultipart("alternative");

        MimeBodyPart textPart = new MimeBodyPart();
        textPart.setText(text, "utf-8");

        MimeBodyPart htmlPart = new MimeBodyPart();
        htmlPart.setContent(HEADER + html + FOOTER, "text/html; charset=utf-8");

        multiPart.addBodyPart(textPart);
        multiPart.addBodyPart(htmlPart);
        msg.setContent(multiPart);
        msg.setSubject(subject, "UTF-8");
        msg.setFrom(new InternetAddress(server.getFrom()));
        msg.setSentDate(new Date());
        for (int i = 0; i < to.length; i++) {
            msg.addRecipient(Message.RecipientType.TO, new InternetAddress(to[i]));
        }
        for (int i = 0; i < cc.length; i++) {
            msg.addRecipient(Message.RecipientType.CC, new InternetAddress(cc[i]));
        }
        for (int i = 0; i < bcc.length; i++) {
            msg.addRecipient(Message.RecipientType.BCC, new InternetAddress(bcc[i]));
        }
        msg.saveChanges();

        Transport transport = session.getTransport("smtp");
        transport.connect(server.getServer(), server.getUser(), server.getPasswd());
        transport.sendMessage(msg, msg.getAllRecipients());
        transport.close();
    }

    private class MyAuthenticator extends Authenticator {
        private String username;
        private String password;

        public MyAuthenticator(String username, String password) {
            this.username = username;
            this.password = password;
        }

        @Override
        public PasswordAuthentication getPasswordAuthentication() {
            return new PasswordAuthentication(username, password);
        }
    }
}