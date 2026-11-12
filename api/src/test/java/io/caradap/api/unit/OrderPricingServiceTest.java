package io.caradap.api.unit;

import io.caradap.api.service.OrderPricingService;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class OrderPricingServiceTest {
  private final OrderPricingService service=new OrderPricingService();
  @Test void multiplicaValorPelaQuantidade() {
    assertEquals(new BigDecimal("98.70"),service.lineTotal(new BigDecimal("32.90"),3));
  }
  @Test void freteGratisParaCompraDeOitentaReais() {
    assertEquals(new BigDecimal("0.00"),service.deliveryFee(new BigDecimal("80.00")));
    assertEquals(new BigDecimal("6.90"),service.deliveryFee(new BigDecimal("79.99")));
  }
  @Test void quantidadeInvalidaNaoPodeSerCobrada() {
    assertThrows(IllegalArgumentException.class,()->service.lineTotal(new BigDecimal("10.00"),0));
    assertThrows(IllegalArgumentException.class,()->service.lineTotal(new BigDecimal("10.00"),51));
  }
  @Test void totalIncluiFrete() {
    assertEquals(new BigDecimal("39.80"),service.total(new BigDecimal("32.90")));
  }
}
