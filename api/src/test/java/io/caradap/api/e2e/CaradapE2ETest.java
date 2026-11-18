package io.caradap.api.e2e;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Execute a API e o Expo Web antes de rodar:
 * mvnww test -Dtest=CaradapE2ETest -Ddemo.delay=1500
 */
class CaradapE2ETest {

    private static final Duration WAIT_TIMEOUT = Duration.ofSeconds(25);
    private static final String SEARCH_INPUT = "[data-testid='search-input']";
    private static final String ACCOUNT_BUTTON = "[data-testid='account-button']";
    
    private static final long DEMO_DELAY_MS = Long.parseLong(
        System.getProperty("demo.delay", "1500")
    );

    private final String webBaseUrl = System.getProperty(
        "web.base",
        "http://localhost:8081"
    );

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeEach
    void startBrowser() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments(
            "--no-sandbox",
            "--window-size=1440,960"
        );

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, WAIT_TIMEOUT);
        driver.get(webBaseUrl);
    }

    @AfterEach
    void stopBrowser() {
        pause(DEMO_DELAY_MS * 2);
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    /**
     * Pesquisa um produto e o adiciona ao carrinho
     * Espera que o item apareça no carrinho.
     */
    void devePesquisarUmProdutoEAdicionaLoAoCarrinho() {
        findElement(SEARCH_INPUT).sendKeys("Smash");
        clickElement("[data-testid='add-product-1']");
        clickElement("[data-testid='cart-button']");

        assertTrue(
            findElement("[data-testid='cart-item-1']").isDisplayed()
        );
    }

    @Test
    /**
     * Registra um novo cliente pela tela de conta
     * Espera que o perfil exibido contenha o nome informado.
     */
    void deveRegistrarUmNovoClientePelaTelaDeConta() {
        clickElement(ACCOUNT_BUTTON);
        clickElement("[data-testid='auth-register-toggle']");
        findElement("[data-testid='auth-name']").sendKeys("Cliente E2E");
        findElement("[data-testid='auth-email']")
            .sendKeys("selenium-" + System.nanoTime() + "@test.com");
        findElement("[data-testid='auth-password']")
            .sendKeys("senhaForte2026");
        clickElement("[data-testid='auth-submit']");

        assertTrue(
            findElement("[data-testid='profile-title']")
                .getText()
                .contains("Cliente E2E")
        );
    }

    private void clickElement(String selector) {
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(selector)))
            .click();
        pause(DEMO_DELAY_MS);
    }

    private org.openqa.selenium.WebElement findElement(String selector) {
        return wait.until(
            ExpectedConditions.visibilityOfElementLocated(By.cssSelector(selector))
        );
    }

    private void pause(long millis) {
        if (millis <= 0) return;
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
