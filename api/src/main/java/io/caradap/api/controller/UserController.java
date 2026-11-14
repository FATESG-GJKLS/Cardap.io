package io.caradap.api.controller;

import java.util.List;
import java.util.Locale;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.caradap.api.dto.ApiDtos.ProfileRequest;
import io.caradap.api.dto.ApiDtos.UserRequest;
import io.caradap.api.dto.ApiDtos.UserView;
import io.caradap.api.entity.AppUser;
import io.caradap.api.repo.OrderRepository;
import io.caradap.api.repo.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(
        UserRepository userRepository,
        OrderRepository orderRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<UserView> findAll() {
        return userRepository.findAll()
            .stream()
            .map(AuthController::toView)
            .toList();
    }

    @GetMapping("/{id}")
    public UserView findById(@PathVariable Long id) {
        return AuthController.toView(findUser(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserView create(@Valid @RequestBody UserRequest request) {
        if (request.password() == null || request.password().length() < 8) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "A senha deve ter ao menos 8 caracteres"
            );
        }

        AppUser user = applyRequest(new AppUser(), request, true);
        return AuthController.toView(userRepository.save(user));
    }

    @PutMapping("/{id}")
    public UserView update(
        @PathVariable Long id,
        @Valid @RequestBody UserRequest request
    ) {
        AppUser user = applyRequest(findUser(id), request, false);
        return AuthController.toView(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
        @PathVariable Long id,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        findUser(id);
        if (currentUser.id.equals(id)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Você não pode excluir sua própria conta de administrador"
            );
        }
        if (orderRepository.existsByCustomerId(id)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Usuário com pedidos não pode ser excluído"
            );
        }
        userRepository.deleteById(id);
    }

    @GetMapping("/me")
    public UserView findCurrentUser(@AuthenticationPrincipal AppUser currentUser) {
        return AuthController.toView(currentUser);
    }

    @PutMapping("/me")
    public UserView updateCurrentUser(
        @AuthenticationPrincipal AppUser currentUser,
        @Valid @RequestBody ProfileRequest request
    ) {
        if (
            !currentUser.email.equalsIgnoreCase(request.email())
                && userRepository.existsByEmailIgnoreCase(request.email())
        ) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "E-mail já cadastrado"
            );
        }

        currentUser.name = request.name().trim();
        currentUser.email = request.email().trim().toLowerCase(Locale.ROOT);
        updatePasswordIfPresent(currentUser, request.password(), "Senha precisa ter 8 caracteres");

        return AuthController.toView(userRepository.save(currentUser));
    }

    private AppUser findUser(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Usuário não encontrado"
            ));
    }

    private AppUser applyRequest(
        AppUser user,
        UserRequest request,
        boolean creation
    ) {
        if (
            (creation || !user.email.equalsIgnoreCase(request.email()))
                && userRepository.existsByEmailIgnoreCase(request.email())
        ) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "E-mail já cadastrado"
            );
        }

        user.name = request.name().trim();
        user.email = request.email().trim().toLowerCase(Locale.ROOT);
        updatePasswordIfPresent(
            user,
            request.password(),
            "A senha deve ter ao menos 8 caracteres"
        );
        user.role = "ADMIN".equalsIgnoreCase(request.role())
            ? "ADMIN"
            : "CUSTOMER";
        return user;
    }

    private void updatePasswordIfPresent(
        AppUser user,
        String password,
        String invalidPasswordMessage
    ) {
        if (password != null && !password.isBlank()) {
            if (password.length() < 8) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    invalidPasswordMessage
                );
            }
            user.passwordHash = passwordEncoder.encode(password);
        }
    }
}
