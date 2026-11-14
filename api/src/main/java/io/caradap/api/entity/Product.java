package io.caradap.api.entity;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, length = 130)
    public String name;

    @Column(nullable = false, length = 600)
    public String description;

    @Column(nullable = false, precision = 10, scale = 2)
    public BigDecimal price;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id")
    public Category category;

    @Column(length = 650)
    public String imageUrl = "";

    @Column(length = 10)
    public String emoji = "🍽️";

    @Column(nullable = false)
    public boolean exotic = false;

    @Column(nullable = false)
    public boolean featured = false;

    @Column(nullable = false)
    public boolean available = true;

    @Column(nullable = false)
    public Integer prepMinutes = 25;

    @Column(nullable = false)
    public Instant createdAt = Instant.now();
}
