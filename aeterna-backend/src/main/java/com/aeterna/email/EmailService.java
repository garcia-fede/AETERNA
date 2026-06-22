package com.aeterna.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Encapsula el envío de correos vía la API REST de EmailJS
 * (https://api.emailjs.com). Se usa HTTP (puerto 443) en lugar de SMTP porque
 * varios hostings (p. ej. Render) bloquean las conexiones SMTP salientes.
 *
 * El contenido del email (HTML, asunto, remitente) se define en la plantilla de
 * EmailJS; desde acá solo se envían las variables (template_params). Las claves
 * se configuran por variables de entorno (ver application.yml / .env.example).
 *
 * IMPORTANTE: en EmailJS hay que habilitar "Allow EmailJS API for non-browser
 * applications" (Account → Security) para permitir las llamadas desde el backend.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private static final String EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${app.mail.emailjs.service-id:}")
    private String serviceId;

    @Value("${app.mail.emailjs.template-id:}")
    private String templateId;

    @Value("${app.mail.emailjs.public-key:}")
    private String publicKey;

    @Value("${app.mail.emailjs.private-key:}")
    private String privateKey;

    /**
     * Envía el correo de invitación con el link para establecer la contraseña.
     *
     * @param destinatario  email del usuario
     * @param nombre        nombre del usuario (para el saludo)
     * @param link          URL completa del frontend con el token
     * @param minutosValido minutos de validez del link
     */
    public void enviarInvitacionContrasena(String destinatario, String nombre, String link, long minutosValido) {
        if (serviceId.isBlank() || templateId.isBlank() || publicKey.isBlank() || privateKey.isBlank()) {
            log.error("EmailJS no está configurado (faltan service-id/template-id/keys): no se envía a {}", destinatario);
            throw new EmailException("El servicio de email no está configurado");
        }

        try {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("service_id", serviceId);
            body.put("template_id", templateId);
            body.put("user_id", publicKey);
            body.put("accessToken", privateKey);

            ObjectNode params = body.putObject("template_params");
            params.put("to_email", destinatario);
            params.put("name", nombre);
            params.put("link", link);
            params.put("minutos", minutosValido);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(EMAILJS_API_URL))
                    .header("content-type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email de invitación enviado a {} (EmailJS, status {})", destinatario, response.statusCode());
            } else {
                log.error("Error enviando email a {} vía EmailJS: status {} - {}",
                        destinatario, response.statusCode(), response.body());
                throw new EmailException("No se pudo enviar el email a " + destinatario);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Envío de email a {} interrumpido: {}", destinatario, e.getMessage());
            throw new EmailException("No se pudo enviar el email a " + destinatario);
        } catch (Exception e) {
            log.error("Error enviando email a {} vía EmailJS: {}", destinatario, e.getMessage());
            throw new EmailException("No se pudo enviar el email a " + destinatario);
        }
    }
}
