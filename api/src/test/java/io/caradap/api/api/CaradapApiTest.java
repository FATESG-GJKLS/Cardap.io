package io.caradap.api.api;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;

import java.util.Map;

import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class CaradapApiTest {

    private static final String ADMIN_EMAIL = "admin@caradap.io";
    private static final String ADMIN_PASSWORD = "Admin@12345";

    @LocalServerPort
    private int port;

    @BeforeEach
    void configureRestAssured() {
        RestAssured.port = port;
    }

    @Test
    /** 
     * Consulta o catálogo sem autenticação
     * Espera mais de cinco produtos, incluindo o Smash da Casa.
     */
    void deveExporOCatalogoDeProdutosParaClientesNaoAutenticados() {
        given()
            .when()
            .get("/api/products")
            .then()
            .statusCode(200)
            .body("size()", greaterThan(5))
            .body("name", hasItem("Smash da Casa"));
    }

    @Test
    /**
     * Envia uma requisição CORS de preflight
     * Espera autorização para a origem do cliente web.
     */
    void devePermitirPreflightDeRequisicoesPublicasParaClientesWeb() {
        given()
            .header("Origin", "http://localhost:8081")
            .header("Access-Control-Request-Method", "POST")
            .header("Access-Control-Request-Headers", "content-type")
            .when()
            .options("/api/auth/login")
            .then()
            .statusCode(200)
            .header("Access-Control-Allow-Origin", equalTo("http://localhost:8081"));
    }

    @Test
    /**
     * Tenta criar um produto sem autenticação administrativa
     * Espera o status 401.
     */
    void deveRejeitarCriacaoDeProdutoSemAutenticacaoAdministrativa() {
        given()
            .contentType("application/json")
            .body(Map.of("name", "Produto indevido"))
            .when()
            .post("/api/products")
            .then()
            .statusCode(401);
    }

    @Test
    /**
     * Registra um cliente e faz login com ele
     * Espera token, perfil CUSTOMER e o e-mail informado.
     */
    void deveRegistrarUmClienteEPermitirSeuLogin() {
        String email = "teste-" + System.nanoTime() + "@example.com";
        Map<String, String> credentials = Map.of(
            "email", email,
            "password", "senhaSegura123"
        );

        given()
            .contentType("application/json")
            .body(Map.of(
                "name", "Pessoa Teste",
                "email", email,
                "password", "senhaSegura123"
            ))
            .when()
            .post("/api/auth/register")
            .then()
            .statusCode(201)
            .body("token", not(emptyOrNullString()))
            .body("user.role", equalTo("CUSTOMER"));

        given()
            .contentType("application/json")
            .body(credentials)
            .when()
            .post("/api/auth/login")
            .then()
            .statusCode(200)
            .body("user.email", equalTo(email));
    }

    @Test
    /**
     * Cria um pedido com preço adulterado
     * Espera que o servidor recalcule subtotal e total corretos.
     */
    void deveRecalcularOsPrecosDoPedidoNoServidor() {
        String adminToken = loginAsAdmin();
        Map<String, Object> orderRequest = Map.of(
            "items", new Object[] {
                Map.of("productId", 1, "quantity", 1, "price", 0.01)
            },
            "deliveryAddress", "Rua de Teste, 100",
            "paymentMethod", "PIX"
        );

        given()
            .auth().oauth2(adminToken)
            .contentType("application/json")
            .body(orderRequest)
            .when()
            .post("/api/orders")
            .then()
            .statusCode(201)
            .body("subtotal", equalTo(32.9f))
            .body("total", equalTo(39.8f));
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
}
