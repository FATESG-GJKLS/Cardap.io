package io.caradap.api.api;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

import java.util.Map;

import io.restassured.RestAssured;
import io.restassured.response.ValidatableResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AdminCrudApiTest {

    private static final String ADMIN_EMAIL = "admin@caradap.io";
    private static final String ADMIN_PASSWORD = "Admin@12345";

    @LocalServerPort
    private int port;

    private String adminToken;

    @BeforeEach
    void authenticateAdmin() {
        RestAssured.port = port;
        adminToken = loginAsAdmin();
    }

    @Test
    void shouldCreateReadUpdateAndDeleteACategory() {
        String slug = "teste-" + System.nanoTime();
        Number categoryId = createCategory(slug);

        getCategory(categoryId, 200)
            .body("name", equalTo("Temporária"));

        updateCategory(categoryId, slug)
            .body("name", equalTo("Editada"));

        deleteCategory(categoryId);

        getCategory(categoryId, 404);
    }

    @Test
    void shouldCreateReadUpdateAndDeleteAUser() {
        String email = "crud-" + System.nanoTime() + "@example.com";
        Number userId = createUser(email);

        getUser(userId, 200)
            .body("email", equalTo(email));

        updateUser(userId, email)
            .body("name", equalTo("Usuário Editado"));

        deleteUser(userId);

        getUser(userId, 404);
    }

    @Test
    void shouldCreateReadUpdateAndDeleteAProduct() {
        Number productId = createProduct();

        getProduct(productId, 200)
            .body("name", equalTo("Teste de Produto"));

        updateProduct(productId)
            .body("name", equalTo("Produto Atualizado"));

        deleteProduct(productId);

        getProduct(productId, 404);
    }

    private String loginAsAdmin() {
        return given()
            .contentType("application/json")
            .body(Map.of(
                "email", ADMIN_EMAIL,
                "password", ADMIN_PASSWORD
            ))
            .when()
            .post("/api/auth/login")
            .then()
            .statusCode(200)
            .extract()
            .path("token");
    }

    private Number createCategory(String slug) {
        return given()
            .auth().oauth2(adminToken)
            .contentType("application/json")
            .body(Map.of(
                "name", "Temporária",
                "slug", slug,
                "emoji", "🧁",
                "description", "Teste automatizado",
                "sortOrder", 25,
                "active", true
            ))
            .when()
            .post("/api/categories")
            .then()
            .statusCode(201)
            .extract()
            .path("id");
    }

    private ValidatableResponse getCategory(
        Number id,
        int expectedStatus
    ) {
        return given()
            .when()
            .get("/api/categories/" + id)
            .then()
            .statusCode(expectedStatus);
    }

    private ValidatableResponse updateCategory(
        Number id,
        String slug
    ) {
        return given()
            .auth().oauth2(adminToken)
            .contentType("application/json")
            .body(Map.of(
                "name", "Editada",
                "slug", slug,
                "emoji", "🧁",
                "description", "Teste atualizado",
                "sortOrder", 24,
                "active", true
            ))
            .when()
            .put("/api/categories/" + id)
            .then()
            .statusCode(200);
    }

    private void deleteCategory(Number id) {
        given()
            .auth().oauth2(adminToken)
            .when()
            .delete("/api/categories/" + id)
            .then()
            .statusCode(204);
    }

    private Number createUser(String email) {
        return given()
            .auth().oauth2(adminToken)
            .contentType("application/json")
            .body(Map.of(
                "name", "Usuário Novo",
                "email", email,
                "password", "senhaForte123",
                "role", "CUSTOMER"
            ))
            .when()
            .post("/api/users")
            .then()
            .statusCode(201)
            .extract()
            .path("id");
    }

    private ValidatableResponse getUser(
        Number id,
        int expectedStatus
    ) {
        return given()
            .auth().oauth2(adminToken)
            .when()
            .get("/api/users/" + id)
            .then()
            .statusCode(expectedStatus);
    }

    private ValidatableResponse updateUser(
        Number id,
        String email
    ) {
        return given()
            .auth().oauth2(adminToken)
            .contentType("application/json")
            .body(Map.of(
                "name", "Usuário Editado",
                "email", email,
                "password", "",
                "role", "CUSTOMER"
            ))
            .when()
            .put("/api/users/" + id)
            .then()
            .statusCode(200);
    }

    private void deleteUser(Number id) {
        given()
            .auth().oauth2(adminToken)
            .when()
            .delete("/api/users/" + id)
            .then()
            .statusCode(204);
    }

    private Number createProduct() {
        return given()
            .auth().oauth2(adminToken)
            .contentType("application/json")
            .body(productBody(
                "Teste de Produto",
                "Temporário para testes",
                13.50,
                "🍔",
                10
            ))
            .when()
            .post("/api/products")
            .then()
            .statusCode(201)
            .extract()
            .path("id");
    }

    private ValidatableResponse getProduct(
        Number id,
        int expectedStatus
    ) {
        return given()
            .when()
            .get("/api/products/" + id)
            .then()
            .statusCode(expectedStatus);
    }

    private ValidatableResponse updateProduct(Number id) {
        return given()
            .auth().oauth2(adminToken)
            .contentType("application/json")
            .body(productBody(
                "Produto Atualizado",
                "Novo texto de teste",
                15.50,
                "🍟",
                15
            ))
            .when()
            .put("/api/products/" + id)
            .then()
            .statusCode(200);
    }

    private void deleteProduct(Number id) {
        given()
            .auth().oauth2(adminToken)
            .when()
            .delete("/api/products/" + id)
            .then()
            .statusCode(204);
    }

    private Map<String, Object> productBody(
        String name,
        String description,
        double price,
        String emoji,
        int preparationMinutes
    ) {
        return Map.of(
            "name", name,
            "description", description,
            "price", price,
            "categoryId", 1,
            "emoji", emoji,
            "imageUrl", "",
            "available", true,
            "featured", false,
            "exotic", false,
            "prepMinutes", preparationMinutes
        );
    }
}
