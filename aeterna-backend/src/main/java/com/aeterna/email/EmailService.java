package com.aeterna.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

/**
 * Encapsula el envío de correos vía SMTP. Las credenciales se configuran
 * por variables de entorno (ver application.yml / .env.example).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.mail.from-name}")
    private String fromName;

    /**
     * Envía el correo de invitación con el link para establecer la contraseña.
     *
     * @param destinatario  email del usuario
     * @param nombre        nombre del usuario (para el saludo)
     * @param link          URL completa del frontend con el token
     * @param minutosValido minutos de validez del link
     */
    public void enviarInvitacionContrasena(String destinatario, String nombre, String link, long minutosValido) {
        String asunto = "AETERNA — Establecé tu contraseña";
        String html = construirHtml(nombre, link, minutosValido);
        enviarHtml(destinatario, asunto, html);
    }

    private void enviarHtml(String destinatario, String asunto, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(from, fromName);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email de invitación enviado a {}", destinatario);
        } catch (MessagingException | UnsupportedEncodingException | MailException e) {
            log.error("Error enviando email a {}: {}", destinatario, e.getMessage());
            throw new EmailException("No se pudo enviar el email a " + destinatario);
        }
    }

    private String construirHtml(String nombre, String link, long minutosValido) {
        return """
                <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937;">
                  <h2 style="color:#0d9488;margin-bottom:4px;">AETERNA</h2>
                  <p style="color:#6b7280;margin-top:0;font-size:13px;">Sistema de Gestión Geriátrica</p>
                  <p>Hola %s,</p>
                  <p>Se creó una cuenta para vos. Hacé clic en el botón para establecer tu contraseña:</p>
                  <p style="text-align:center;margin:28px 0;">
                    <a href="%s" style="background:#0d9488;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block;">
                      Establecer contraseña
                    </a>
                  </p>
                  <p style="font-size:13px;color:#6b7280;">
                    Este enlace vence en <strong>%d minutos</strong> y solo puede usarse una vez.
                    Si vos no solicitaste esto, podés ignorar este correo.
                  </p>
                  <p style="font-size:12px;color:#9ca3af;word-break:break-all;">
                    Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br/>%s
                  </p>
                </div>
                """.formatted(nombre, link, minutosValido, link);
    }
}
