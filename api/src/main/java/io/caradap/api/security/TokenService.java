package io.caradap.api.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.caradap.api.entity.AppUser;

@Service
public class TokenService {

    private static final Base64.Encoder ENCODER =
        Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private static final long TOKEN_LIFETIME_SECONDS = 60 * 60 * 24;

    private final String secret;
    private final ObjectMapper objectMapper;

    public TokenService(
        @Value("${app.jwt-secret}") String secret,
        ObjectMapper objectMapper
    ) {
        if (secret.length() < 32) {
            throw new IllegalArgumentException(
                "JWT_SECRET deve ter ao menos 32 caracteres"
            );
        }

        this.secret = secret;
        this.objectMapper = objectMapper;
    }

    private String encode(Object value) throws Exception {
        return ENCODER.encodeToString(objectMapper.writeValueAsBytes(value));
    }

    private String signature(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec key = new SecretKeySpec(
            secret.getBytes(StandardCharsets.UTF_8),
            "HmacSHA256"
        );
        mac.init(key);

        return ENCODER.encodeToString(
            mac.doFinal(data.getBytes(StandardCharsets.UTF_8))
        );
    }

    public String issue(AppUser user) {
        try {
            String header = encode(Map.of(
                "alg",
                "HS256",
                "typ",
                "JWT"
            ));
            String payload = encode(Map.of(
                "sub",
                user.email,
                "exp",
                Instant.now().plusSeconds(TOKEN_LIFETIME_SECONDS).getEpochSecond()
            ));
            String body = header + "." + payload;

            return body + "." + signature(body);
        } catch (Exception exception) {
            throw new IllegalStateException(
                "Não foi possível criar a sessão",
                exception
            );
        }
    }

    public Optional<String> emailFrom(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return Optional.empty();
            }

            JsonNode header = objectMapper.readTree(DECODER.decode(parts[0]));
            if (!"HS256".equals(header.path("alg").asText())) {
                return Optional.empty();
            }

            String expectedSignature = signature(parts[0] + "." + parts[1]);
            boolean signatureMatches = MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8)
            );
            if (!signatureMatches) {
                return Optional.empty();
            }

            JsonNode payload = objectMapper.readTree(DECODER.decode(parts[1]));
            if (payload.path("exp").asLong(0) <= Instant.now().getEpochSecond()) {
                return Optional.empty();
            }

            String email = payload.path("sub").asText("");
            return email.isBlank() ? Optional.empty() : Optional.of(email);
        } catch (Exception exception) {
            return Optional.empty();
        }
    }
}
