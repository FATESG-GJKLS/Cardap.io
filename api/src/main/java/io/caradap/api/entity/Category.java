package io.caradap.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, length = 75)
    public String name;

    @Column(nullable = false, unique = true, length = 100)
    public String slug;

    @Column(nullable = false, length = 10)
    public String emoji = "🍽️";

    @Column(length = 250)
    public String description = "";

    @Column(nullable = false)
    public Integer sortOrder = 0;

    @Column(nullable = false)
    public boolean active = true;
}
