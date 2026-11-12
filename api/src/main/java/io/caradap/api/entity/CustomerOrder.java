package io.caradap.api.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name="customer_orders")
public class CustomerOrder {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
  @ManyToOne(fetch=FetchType.EAGER, optional=false) public AppUser customer;
  @Column(nullable=false, length=320) public String deliveryAddress;
  @Column(nullable=false, length=40) public String paymentMethod;
  @Column(length=500) public String notes = "";
  @Column(nullable=false, length=30) public String status = "RECEIVED";
  @Column(nullable=false, precision=10, scale=2) public BigDecimal subtotal;
  @Column(nullable=false, precision=10, scale=2) public BigDecimal deliveryFee;
  @Column(nullable=false, precision=10, scale=2) public BigDecimal total;
  @Column(nullable=false) public Instant createdAt = Instant.now();
  @OneToMany(mappedBy="order", cascade=CascadeType.ALL, orphanRemoval=true, fetch=FetchType.EAGER)
  public List<OrderItem> items = new ArrayList<>();
}
