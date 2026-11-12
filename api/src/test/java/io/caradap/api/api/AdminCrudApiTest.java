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
class AdminCrudApiTest {
  @LocalServerPort int port;
  private String token;
  @BeforeEach void login() {
    RestAssured.port = port;
    token=given().contentType("application/json")
      .body(Map.of("email","admin@caradap.io","password","Admin@12345"))
      .when().post("/api/auth/login").then().statusCode(200).extract().path("token");
  }
  @Test void crudCategoriaComCriacaoEdicaoLeituraEExclusao() {
    String slug="teste-"+System.nanoTime();
    Number id=given().auth().oauth2(token).contentType("application/json")
      .body(Map.of("name","Temporária","slug",slug,"emoji","🧁","description","Teste automatizado","sortOrder",25,"active",true))
      .when().post("/api/categories").then().statusCode(201).extract().path("id");
    given().when().get("/api/categories/"+id).then().statusCode(200).body("name",equalTo("Temporária"));
    given().auth().oauth2(token).contentType("application/json")
      .body(Map.of("name","Editada","slug",slug,"emoji","🧁","description","Teste atualizado","sortOrder",24,"active",true))
      .when().put("/api/categories/"+id).then().statusCode(200).body("name",equalTo("Editada"));
    given().auth().oauth2(token).when().delete("/api/categories/"+id).then().statusCode(204);
    given().when().get("/api/categories/"+id).then().statusCode(404);
  }
  @Test void crudUsuariosRestritoAoAdministrador() {
    String email="crud-"+System.nanoTime()+"@example.com";
    Number id=given().auth().oauth2(token).contentType("application/json")
      .body(Map.of("name","Usuário Novo","email",email,"password","senhaForte123","role","CUSTOMER"))
      .when().post("/api/users").then().statusCode(201).extract().path("id");
    given().auth().oauth2(token).when().get("/api/users/"+id).then().statusCode(200).body("email",equalTo(email));
    given().auth().oauth2(token).contentType("application/json")
      .body(Map.of("name","Usuário Editado","email",email,"password","","role","CUSTOMER"))
      .when().put("/api/users/"+id).then().statusCode(200).body("name",equalTo("Usuário Editado"));
    given().auth().oauth2(token).when().delete("/api/users/"+id).then().statusCode(204);
    given().auth().oauth2(token).when().get("/api/users/"+id).then().statusCode(404);
  }
  @Test void crudProdutoComCriacaoEdicaoLeituraEExclusao() {
    Number id=given().auth().oauth2(token).contentType("application/json")
      .body(Map.of("name","Teste de Produto","description","Temporário para testes","price",13.50,"categoryId",1,
        "emoji","🍔","imageUrl","","available",true,"featured",false,"exotic",false,"prepMinutes",10))
      .when().post("/api/products").then().statusCode(201).extract().path("id");
    given().when().get("/api/products/"+id).then().statusCode(200).body("name",equalTo("Teste de Produto"));
    given().auth().oauth2(token).contentType("application/json")
      .body(Map.of("name","Produto Atualizado","description","Novo texto de teste","price",15.50,"categoryId",1,
        "emoji","🍟","imageUrl","","available",true,"featured",false,"exotic",false,"prepMinutes",15))
      .when().put("/api/products/"+id).then().statusCode(200).body("name",equalTo("Produto Atualizado"));
    given().auth().oauth2(token).when().delete("/api/products/"+id).then().statusCode(204);
    given().when().get("/api/products/"+id).then().statusCode(404);
  }
}
