package io.caradap.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import io.caradap.api.service.OrderPricingService;

class OrderPricingServiceTest {
    private static final BigDecimal PRODUCT_PRICE = new BigDecimal("32.90");
    private static final BigDecimal EXPECTED_LINE_TOTAL = new BigDecimal("98.70");

    private final OrderPricingService pricingService = new OrderPricingService();

    @Test
    void shouldMultiplyProductPriceByQuantity() {
        BigDecimal lineTotal = pricingService.lineTotal(PRODUCT_PRICE, 3);

        assertEquals(EXPECTED_LINE_TOTAL, lineTotal);
    }

    @Test
    void shouldOfferFreeShippingAtTheMinimumSubtotal() {
        BigDecimal freeShipping = pricingService.deliveryFee(new BigDecimal("80.00"));
        BigDecimal paidShipping = pricingService.deliveryFee(new BigDecimal("79.99"));

        assertEquals(new BigDecimal("0.00"), freeShipping);
        assertEquals(new BigDecimal("6.90"), paidShipping);
    }

    @Test
    void shouldRejectQuantitiesOutsideTheAllowedRange() {
        assertThrows(
            IllegalArgumentException.class,
            () -> pricingService.lineTotal(new BigDecimal("10.00"), 0)
        );
        assertThrows(
            IllegalArgumentException.class,
            () -> pricingService.lineTotal(new BigDecimal("10.00"), 51)
        );
    }

    @Test
    void shouldAddShippingToTheOrderTotal() {
        BigDecimal total = pricingService.total(new BigDecimal("32.90"));

        assertEquals(new BigDecimal("39.80"), total);
    }
}
