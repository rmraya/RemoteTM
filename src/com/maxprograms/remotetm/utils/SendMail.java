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

    private static final String HEADER = "<div style='width:100%; background:#0073B5; color:#ffffff; font-size:1.4em; padding:8px; margin-bottom: 1em; height:2em;'>RemoteTM</div>";
    private static final String FOOTER = "<div style='width:100%; background:#0073B5; color:#ffffff; font-size:0.8em; padding:4px; text-align:center; margin-top: 1em; height:2em;'>"
            + "Copyright &copy; 2008-2021 <a href='https://maxprograms.com' style='color:#ffffff;'>Maxprograms</a></div>";

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