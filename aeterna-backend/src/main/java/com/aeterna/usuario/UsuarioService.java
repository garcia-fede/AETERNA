package com.aeterna.usuario;

import com.aeterna.common.exception.BadRequestException;
import com.aeterna.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> listar(Rol rol) {
        if (rol != null) {
            return usuarioRepository.findAllByRol(rol);
        }
        return usuarioRepository.findAll();
    }

    public List<Usuario> listarActivos() {
        return usuarioRepository.findAllByActivoTrue();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con id: " + id));
    }

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con email: " + email));
    }

    @Transactional
    public Usuario crear(String nombre, String apellido, String email, String password, Rol rol) {
        return usuarioRepository.findByEmail(email).map(existente -> {
            if (existente.getActivo()) {
                throw new BadRequestException("Ya existe un usuario activo con el email: " + email);
            }
            existente.setNombre(nombre);
            existente.setApellido(apellido);
            existente.setRol(rol);
            existente.setPasswordHash(passwordEncoder.encode(password));
            existente.setActivo(true);
            return usuarioRepository.save(existente);
        }).orElseGet(() -> {
            Usuario usuario = Usuario.builder()
                    .nombre(nombre)
                    .apellido(apellido)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .rol(rol)
                    .activo(true)
                    .build();
            return usuarioRepository.save(usuario);
        });
    }

    @Transactional
    public Usuario actualizar(Long id, String nombre, String apellido, Rol rol) {
        Usuario usuario = buscarPorId(id);
        usuario.setNombre(nombre);
        usuario.setApellido(apellido);
        usuario.setRol(rol);
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario actualizarConEmail(Long id, String nombre, String apellido, String email, Rol rol) {
        Usuario usuario = buscarPorId(id);
        if (!usuario.getEmail().equals(email) && usuarioRepository.existsByEmail(email)) {
            throw new BadRequestException("Ya existe un usuario con el email: " + email);
        }
        usuario.setNombre(nombre);
        usuario.setApellido(apellido);
        usuario.setEmail(email);
        usuario.setRol(rol);
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void activarDesactivar(Long id, boolean activo) {
        Usuario usuario = buscarPorId(id);
        usuario.setActivo(activo);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void cambiarPassword(Long id, String passwordNueva) {
        Usuario usuario = buscarPorId(id);
        usuario.setPasswordHash(passwordEncoder.encode(passwordNueva));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void desactivar(Long id) {
        activarDesactivar(id, false);
    }
}
