package io.caradap.api.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class OrderPricingService {
  public BigDecimal lineTotal(BigDecimal price, int quantity) {
    if (price == null || price.signum() < 0 || quantity <= 0 || quantity > 50)
      throw new IllegalArgumentException("Preço ou quantidade inválidos");
    return price.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
  }
  public BigDecimal deliveryFee(BigDecimal subtotal) {
    if (subtotal.signum() < 0) throw new IllegalArgumentException("Subtotal inválido");
    return subtotal.compareTo(new BigDecimal("80.00")) >= 0 ? new BigDecimal("0.00") : new BigDecimal("6.90");
  }
  public BigDecimal total(BigDecimal subtotal) { return subtotal.add(deliveryFee(subtotal)); }
}
