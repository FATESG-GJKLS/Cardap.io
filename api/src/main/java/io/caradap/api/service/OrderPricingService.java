package io.caradap.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;

@Service
public class OrderPricingService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("80.00");
    private static final BigDecimal STANDARD_DELIVERY_FEE = new BigDecimal("6.90");
    private static final BigDecimal FREE_DELIVERY_FEE = new BigDecimal("0.00");

    public BigDecimal lineTotal(BigDecimal price, int quantity) {
        if (price == null || price.signum() < 0 || quantity <= 0 || quantity > 50) {
            throw new IllegalArgumentException("Preço ou quantidade inválidos");
        }

        return price
            .multiply(BigDecimal.valueOf(quantity))
            .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal deliveryFee(BigDecimal subtotal) {
        if (subtotal.signum() < 0) {
            throw new IllegalArgumentException("Subtotal inválido");
        }

        return subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
            ? FREE_DELIVERY_FEE
            : STANDARD_DELIVERY_FEE;
    }

    public BigDecimal total(BigDecimal subtotal) {
        return subtotal.add(deliveryFee(subtotal));
    }
}
