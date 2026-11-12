package io.caradap.api.config;

import io.caradap.api.security.JwtFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {
  @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
  @Bean CorsConfigurationSource corsSource(@Value("${app.cors-origins}") String origins) {
    CorsConfiguration config=new CorsConfiguration();
    config.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).toList());
    config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization","Content-Type","Accept"));
    UrlBasedCorsConfigurationSource source=new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**",config);
    return source;
  }
  @Bean SecurityFilterChain security(HttpSecurity http, JwtFilter jwt) throws Exception {
    return http.csrf(csrf->csrf.disable()).cors(Customizer.withDefaults())
      .sessionManagement(sm->sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .formLogin(form->form.disable()).httpBasic(basic->basic.disable())
      .exceptionHandling(ex->ex.authenticationEntryPoint((req,res,e)->res.sendError(HttpServletResponse.SC_UNAUTHORIZED,"Faça login para continuar"))
        .accessDeniedHandler((req,res,e)->res.sendError(HttpServletResponse.SC_FORBIDDEN,"Sem permissão")))
      .authorizeHttpRequests(auth->auth
        .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
        .requestMatchers("/api/auth/**","/api/health").permitAll()
        .requestMatchers(HttpMethod.GET,"/api/categories","/api/categories/**","/api/products","/api/products/**").permitAll()
        .requestMatchers("/api/users/me").authenticated()
        .requestMatchers("/api/users","/api/users/**").hasRole("ADMIN")
        .requestMatchers("/api/categories","/api/categories/**","/api/products","/api/products/**").hasRole("ADMIN")
        .requestMatchers("/api/orders/mine").authenticated()
        .requestMatchers(HttpMethod.POST,"/api/orders").authenticated()
        .requestMatchers("/api/orders","/api/orders/**").hasRole("ADMIN")
        .anyRequest().denyAll())
      .addFilterBefore(jwt,UsernamePasswordAuthenticationFilter.class).build();
  }
}
