package io.caradap.api.controller;

import io.caradap.api.dto.ApiDtos.*;
import io.caradap.api.entity.AppUser;
import io.caradap.api.repo.UserRepository;
import io.caradap.api.security.TokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Locale;

@RestController @RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users; private final PasswordEncoder password; private final TokenService tokens;
  public AuthController(UserRepository users,PasswordEncoder password,TokenService tokens){this.users=users;this.password=password;this.tokens=tokens;}
  static UserView view(AppUser u) { return new UserView(u.id,u.name,u.email,u.role,u.createdAt); }
  @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@Valid @RequestBody RegisterRequest request){
    String email=request.email().trim().toLowerCase(Locale.ROOT);
    if(users.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT,"E-mail já cadastrado");
    AppUser u=new AppUser(); u.name=request.name().trim();u.email=email;u.passwordHash=password.encode(request.password());
    u.role="CUSTOMER"; users.save(u);
    return new AuthResponse(tokens.issue(u),view(u));
  }
  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request){
    AppUser u=users.findByEmailIgnoreCase(request.email().trim()).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"E-mail ou senha inválidos"));
    if(!password.matches(request.password(),u.passwordHash)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"E-mail ou senha inválidos");
    return new AuthResponse(tokens.issue(u),view(u));
  }
}
