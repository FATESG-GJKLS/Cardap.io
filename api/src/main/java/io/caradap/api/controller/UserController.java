package io.caradap.api.controller;

import io.caradap.api.dto.ApiDtos.*;
import io.caradap.api.entity.AppUser;
import io.caradap.api.repo.OrderRepository;
import io.caradap.api.repo.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Locale;

@RestController @RequestMapping("/api/users")
public class UserController {
  private final UserRepository users;private final OrderRepository orders;private final PasswordEncoder password;
  public UserController(UserRepository users,OrderRepository orders,PasswordEncoder password){this.users=users;this.orders=orders;this.password=password;}
  @GetMapping public List<UserView> all(){return users.findAll().stream().map(AuthController::view).toList();}
  @GetMapping("/{id}") public UserView get(@PathVariable Long id){return AuthController.view(find(id));}
  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  public UserView create(@Valid @RequestBody UserRequest body){
    if(body.password()==null||body.password().length()<8) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A senha deve ter ao menos 8 caracteres");
    return AuthController.view(users.save(apply(new AppUser(),body,true)));
  }
  @PutMapping("/{id}") public UserView update(@PathVariable Long id,@Valid @RequestBody UserRequest body){return AuthController.view(users.save(apply(find(id),body,false)));}
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id,@AuthenticationPrincipal AppUser current){
    find(id);if(current.id.equals(id)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Você não pode excluir sua própria conta de administrador");
    if(orders.existsByCustomerId(id))throw new ResponseStatusException(HttpStatus.CONFLICT,"Usuário com pedidos não pode ser excluído");users.deleteById(id);
  }
  @GetMapping("/me") public UserView me(@AuthenticationPrincipal AppUser current){return AuthController.view(current);}
  @PutMapping("/me") public UserView editMe(@AuthenticationPrincipal AppUser current,@Valid @RequestBody ProfileRequest body){
    if(!current.email.equalsIgnoreCase(body.email())&&users.existsByEmailIgnoreCase(body.email())) throw new ResponseStatusException(HttpStatus.CONFLICT,"E-mail já cadastrado");
    current.name=body.name().trim();current.email=body.email().trim().toLowerCase(Locale.ROOT);
    if(body.password()!=null&&!body.password().isBlank()){
      if(body.password().length()<8)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Senha precisa ter 8 caracteres");
      current.passwordHash=password.encode(body.password());
    }
    return AuthController.view(users.save(current));
  }
  private AppUser find(Long id){return users.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Usuário não encontrado"));}
  private AppUser apply(AppUser u,UserRequest b,boolean creation){
    if((creation||!u.email.equalsIgnoreCase(b.email()))&&users.existsByEmailIgnoreCase(b.email()))throw new ResponseStatusException(HttpStatus.CONFLICT,"E-mail já cadastrado");
    u.name=b.name().trim();u.email=b.email().trim().toLowerCase(Locale.ROOT);
    if(b.password()!=null&&!b.password().isBlank()){
      if(b.password().length()<8)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A senha deve ter ao menos 8 caracteres");
      u.passwordHash=password.encode(b.password());
    }
    u.role="ADMIN".equalsIgnoreCase(b.role())?"ADMIN":"CUSTOMER";return u;
  }
}
