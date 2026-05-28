package com.aeterna.auth;

import com.aeterna.auth.dto.LoginRequest;
import com.aeterna.auth.dto.LoginResponse;
import com.aeterna.auth.dto.RegisterRequest;
import com.aeterna.common.dto.ApiResponse;
import com.aeterna.common.exception.BadRequestException;
import com.aeterna.config.JwtService;
import com.aeterna.usuario.Rol;
import com.aeterna.usuario.Usuario;
import com.aeterna.usuario.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Usuario no encontrado"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("rol", usuario.getRol().name());
        extraClaims.put("userId", usuario.getId());

        String token = jwtService.generateToken(userDetails, extraClaims);

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .userId(usuario.getId())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(response, "Login exitoso"));
    }

    // Solo ADMIN puede registrar nuevos usuarios (excepto bootstrap del primer admin)
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Ya existe un usuario con ese email");
        }

        Usuario nuevo = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol())
                .activo(true)
                .build();

        usuarioRepository.save(nuevo);
        return ResponseEntity.ok(ApiResponse.ok(null, "Usuario registrado correctamente"));
    }
}
