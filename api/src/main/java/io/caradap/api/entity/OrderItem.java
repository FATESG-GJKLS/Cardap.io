package io.caradap.api.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    public CustomerOrder order;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    public Product product;

    @Column(nullable = false)
    public Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    public BigDecimal unitPrice;

    @Column(nullable = false, length = 130)
    public String productName;
}
