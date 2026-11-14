package io.caradap.api.config;

import io.caradap.api.security.JwtFilter;
import jakarta.servlet.http.HttpServletResponse;
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
import java.util.List;

@Configuration
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    
    config.setAllowedOriginPatterns(List.of("*")); 
    config.setAllowedMethods(List.of("*")); 
    config.setAllowedHeaders(List.of("*"));
    config.setExposedHeaders(List.of("*")); 
    
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }

  @Bean
  SecurityFilterChain security(HttpSecurity http, JwtFilter jwt) throws Exception {
    return http.csrf(csrf -> csrf.disable()).cors(Customizer.withDefaults())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .formLogin(form -> form.disable()).httpBasic(basic -> basic.disable())
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint(
                (req, res, e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Faça login para continuar"))
            .accessDeniedHandler((req, res, e) -> res.sendError(HttpServletResponse.SC_FORBIDDEN, "Sem permissão")))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers("/api/auth/**", "/api/health").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**", "/api/products",
                "/api/products/**")
            .permitAll()
            .requestMatchers("/api/users/me").authenticated()
            .requestMatchers("/api/users", "/api/users/**").hasRole("ADMIN")
            .requestMatchers("/api/categories", "/api/categories/**", "/api/products", "/api/products/**")
            .hasRole("ADMIN")
            .requestMatchers("/api/orders/mine").authenticated()
            .requestMatchers(HttpMethod.POST, "/api/orders").authenticated()
            .requestMatchers("/api/orders", "/api/orders/**").hasRole("ADMIN")
            .anyRequest().denyAll())
        .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class).build();
  }
}
