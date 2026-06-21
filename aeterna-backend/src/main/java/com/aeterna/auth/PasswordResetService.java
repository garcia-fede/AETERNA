package com.aeterna.auth;

import com.aeterna.common.exception.BadRequestException;
import com.aeterna.email.EmailService;
import com.aeterna.usuario.Usuario;
import com.aeterna.usuario.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Orquesta el flujo de invitación / restablecimiento de contraseña:
 * generación del token, envío del email y aplicación del cambio.
 */
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UsuarioService usuarioService;
    private final EmailService emailService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.password-reset.expiration-minutes}")
    private long expirationMinutes;

    /**
     * Genera un token de un solo uso para el usuario indicado y le envía el
     * email con el link para establecer su contraseña. Invalida cualquier token
     * previo vigente del usuario.
     */
    @Transactional
    public void enviarInvitacion(Long usuarioId) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);

        tokenRepository.invalidarVigentesDe(usuario);

        String rawToken = generarTokenAleatorio();
        PasswordResetToken token = PasswordResetToken.builder()
                .tokenHash(hash(rawToken))
                .usuario(usuario)
                .expiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                .used(false)
                .build();
        tokenRepository.save(token);

        String link = frontendUrl + "/reset-password?token=" + rawToken;
        emailService.enviarInvitacionContrasena(
                usuario.getEmail(), usuario.getNombre(), link, expirationMinutes);
    }

    /**
     * Valida un token en claro. Lanza {@link BadRequestException} si no existe,
     * ya fue usado o expiró. Devuelve el usuario asociado.
     */
    @Transactional(readOnly = true)
    public Usuario validarToken(String rawToken) {
        PasswordResetToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new BadRequestException("El enlace no es válido"));
        if (!token.isUsable()) {
            throw new BadRequestException("El enlace expiró o ya fue utilizado");
        }
        return token.getUsuario();
    }

    /**
     * Aplica el cambio de contraseña usando un token válido y lo marca como usado.
     */
    @Transactional
    public void restablecer(String rawToken, String passwordNueva) {
        PasswordResetToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new BadRequestException("El enlace no es válido"));
        if (!token.isUsable()) {
            throw new BadRequestException("El enlace expiró o ya fue utilizado");
        }
        usuarioService.cambiarPassword(token.getUsuario().getId(), passwordNueva);
        token.setUsed(true);
        tokenRepository.save(token);
    }

    private String generarTokenAleatorio() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return URL_ENCODER.encodeToString(bytes);
    }

    /** SHA-256 en hex. Apto para tokens de alta entropía (no son contraseñas). */
    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }
}
