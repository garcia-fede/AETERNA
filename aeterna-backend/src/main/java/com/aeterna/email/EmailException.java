package com.aeterna.email;

/** Error al enviar un correo (fallo de SMTP, credenciales, etc.). */
public class EmailException extends RuntimeException {
    public EmailException(String message) {
        super(message);
    }
}
