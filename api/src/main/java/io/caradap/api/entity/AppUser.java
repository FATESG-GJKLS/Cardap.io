package io.caradap.api.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, length = 100)
    public String name;

    @Column(nullable = false, unique = true, length = 180)
    public String email;

    @Column(nullable = false)
    public String passwordHash;

    @Column(nullable = false, length = 20)
    public String role = "CUSTOMER";

    @Column(nullable = false)
    public Instant createdAt = Instant.now();
}
