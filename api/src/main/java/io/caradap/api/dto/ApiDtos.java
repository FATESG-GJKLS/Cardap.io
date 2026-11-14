package io.caradap.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class ApiDtos {

    private ApiDtos() {
    }

    public record RegisterRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        @Size(min = 8) String password
    ) {
    }

    public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank String password
    ) {
    }

    public record UserRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        String password,
        String role
    ) {
    }

    public record ProfileRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        String password
    ) {
    }

    public record UserView(
        Long id,
        String name,
        String email,
        String role,
        Instant createdAt
    ) {
    }

    public record AuthResponse(String token, UserView user) {
    }

    public record CategoryRequest(
        @NotBlank String name,
        @NotBlank String slug,
        String emoji,
        String description,
        Integer sortOrder,
        Boolean active
    ) {
    }

    public record ProductRequest(
        @NotBlank String name,
        @NotBlank String description,
        @NotNull @DecimalMin("0.01") BigDecimal price,
        @NotNull Long categoryId,
        String imageUrl,
        String emoji,
        Boolean exotic,
        Boolean featured,
        Boolean available,
        @Min(1) Integer prepMinutes
    ) {
    }

    public record ProductView(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Long categoryId,
        String categoryName,
        String imageUrl,
        String emoji,
        boolean exotic,
        boolean featured,
        boolean available,
        Integer prepMinutes
    ) {
    }

    public record OrderLineRequest(
        @NotNull Long productId,
        @NotNull @Min(1) @Max(50) Integer quantity
    ) {
    }

    public record OrderRequest(
        @NotEmpty List<@Valid OrderLineRequest> items,
        @NotBlank @Size(min = 8) String deliveryAddress,
        @NotBlank @Pattern(regexp = "PIX|CARD|CASH") String paymentMethod,
        String notes
    ) {
    }

    public record OrderLineView(
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice
    ) {
    }

    public record OrderView(
        Long id,
        Long customerId,
        String customerName,
        String deliveryAddress,
        String paymentMethod,
        String notes,
        String status,
        BigDecimal subtotal,
        BigDecimal deliveryFee,
        BigDecimal total,
        Instant createdAt,
        List<OrderLineView> items
    ) {
    }

    public record StatusRequest(@NotBlank String status) {
    }
}
