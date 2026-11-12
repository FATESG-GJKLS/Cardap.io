package io.caradap.api.security;

import io.caradap.api.repo.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {
  private final TokenService tokens;
  private final UserRepository users;
  public JwtFilter(TokenService tokens, UserRepository users) { this.tokens=tokens; this.users=users; }
  @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
    String authorization=request.getHeader("Authorization");
    if (authorization!=null && authorization.startsWith("Bearer ")) {
      tokens.emailFrom(authorization.substring(7))
        .flatMap(users::findByEmailIgnoreCase)
        .ifPresent(user -> SecurityContextHolder.getContext().setAuthentication(
          new UsernamePasswordAuthenticationToken(user,null,List.of(new SimpleGrantedAuthority("ROLE_"+user.role)))));
    }
    chain.doFilter(request,response);
  }
}
