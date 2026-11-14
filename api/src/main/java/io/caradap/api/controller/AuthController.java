package io.caradap.api.controller;

import java.util.Locale;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.caradap.api.dto.ApiDtos.AuthResponse;
import io.caradap.api.dto.ApiDtos.LoginRequest;
import io.caradap.api.dto.ApiDtos.RegisterRequest;
import io.caradap.api.dto.ApiDtos.UserView;
import io.caradap.api.entity.AppUser;
import io.caradap.api.repo.UserRepository;
import io.caradap.api.security.TokenService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthController(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        TokenService tokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    static UserView toView(AppUser user) {
        return new UserView(
            user.id,
            user.name,
            user.email,
            user.role,
            user.createdAt
        );
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "E-mail já cadastrado"
            );
        }

        AppUser user = new AppUser();
        user.name = request.name().trim();
        user.email = email;
        user.passwordHash = passwordEncoder.encode(request.password());
        user.role = "CUSTOMER";
        userRepository.save(user);

        return new AuthResponse(tokenService.issue(user), toView(user));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        AppUser user = userRepository.findByEmailIgnoreCase(request.email().trim())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "E-mail ou senha inválidos"
            ));

        if (!passwordEncoder.matches(request.password(), user.passwordHash)) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "E-mail ou senha inválidos"
            );
        }

        return new AuthResponse(tokenService.issue(user), toView(user));
    }
}
