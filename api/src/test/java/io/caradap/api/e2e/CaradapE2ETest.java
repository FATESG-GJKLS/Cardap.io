package io.caradap.api.e2e;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;
import static org.junit.jupiter.api.Assertions.*;

/** Execute a API e o Expo Web antes de rodar: mvn test -Pe2e */
class CaradapE2ETest {
  private WebDriver driver;
  private WebDriverWait wait;
  private final String base=System.getProperty("web.base","http://localhost:8081");
  @BeforeEach void start(){
    ChromeOptions options=new ChromeOptions();options.addArguments("--headless=new","--no-sandbox","--disable-dev-shm-usage","--window-size=1440,960");
    driver=new ChromeDriver(options);wait=new WebDriverWait(driver,Duration.ofSeconds(25));driver.get(base);
  }
  @AfterEach void stop(){if(driver!=null)driver.quit();}
  @Test void pesquisaProdutoEAdicionaAoCarrinho(){
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='search-input']"))).sendKeys("Smash");
    wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='add-product-1']"))).click();
    wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='cart-button']"))).click();
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='cart-item-1']"))).isDisplayed());
  }
  @Test void abreCadastroERegistraNovoCliente(){
    wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='account-button']"))).click();
    wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='auth-register-toggle']"))).click();
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='auth-name']"))).sendKeys("Cliente E2E");
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='auth-email']"))).sendKeys("selenium-"+System.nanoTime()+"@test.com");
    driver.findElement(By.cssSelector("[data-testid='auth-password']")).sendKeys("senhaForte2026");
    driver.findElement(By.cssSelector("[data-testid='auth-submit']")).click();
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='profile-title']"))).getText().contains("Cliente E2E"));
  }
}
