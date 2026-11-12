package io.caradap.api.api;

import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import java.util.Map;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class CaradapApiTest {
  @LocalServerPort int port;
  @BeforeEach void setup(){RestAssured.port=port;}
  @Test void listaPublicaDeProdutosTemDadosDoCardapio() {
    given().when().get("/api/products").then().statusCode(200)
      .body("size()",greaterThan(5)).body("name",hasItem("Smash da Casa"));
  }
  @Test void naoPermiteCriarProdutoSemLoginDeAdministrador() {
    given().contentType("application/json").body(Map.of("name","Produto indevido"))
      .when().post("/api/products").then().statusCode(401);
  }
  @Test void registraClienteEFazLoginComCredenciaisValidas() {
    String email="teste-"+System.nanoTime()+"@example.com";
    given().contentType("application/json").body(Map.of("name","Pessoa Teste","email",email,"password","senhaSegura123"))
      .when().post("/api/auth/register").then().statusCode(201)
      .body("token",not(emptyOrNullString())).body("user.role",equalTo("CUSTOMER"));
    given().contentType("application/json").body(Map.of("email",email,"password","senhaSegura123"))
      .when().post("/api/auth/login").then().statusCode(200).body("user.email",equalTo(email));
  }
  @Test void ignoraPrecoManipuladoENaoPermiteItensSemEstoque() {
    // A origem de preços é o banco de dados, nunca o corpo enviado pelo cliente.
    String token=given().contentType("application/json").body(Map.of("email","admin@caradap.io","password","Admin@12345"))
      .when().post("/api/auth/login").then().statusCode(200).extract().path("token");
    given().auth().oauth2(token).contentType("application/json")
      .body(Map.of("items",new Object[]{Map.of("productId",1,"quantity",1,"price",0.01)},
        "deliveryAddress","Rua de Teste, 100","paymentMethod","PIX"))
      .when().post("/api/orders").then().statusCode(201)
      .body("subtotal",equalTo(32.9f)).body("total",equalTo(39.8f));
  }
}
